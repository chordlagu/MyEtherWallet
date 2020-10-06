import BigNumber from 'bignumber.js';
import utils from 'web3-utils';
import { address, bool, bytes, int, string, uint } from './solidityTypes';
import { isAddress } from '@/helpers/addressUtils';
import sanitizeHex from '@/helpers/sanitizeHex';
import * as ethUnit from 'ethjs-unit';
import { Transaction } from 'ethereumjs-tx';

import Web3 from 'web3';
import { bufferToHex, generateAddress, toBuffer } from 'ethereumjs-util';

const stringToArray = str => {
  return str.replace(/[^a-zA-Z0-9_,]+/g, '').split(',');
};

const isInt = num => {
  try {
    utils.toBN(num);
    return true;
  } catch (e) {
    return false;
  }
};

const validateHexString = str => {
  if (str === '') return true;
  str =
    str.substring(0, 2) === '0x'
      ? str.substring(2).toUpperCase()
      : str.toUpperCase();
  return utils.isHex(str);
};

export default class Contracts {
  constructor(address, web3, gasPrice, storeHandler) {
    try {
      this.userAddress = address;
      this.address = '';
      this.address = '0x0d8775f648430679a709e98d2b0cb6250d2887ef'; // todo remove dev item
      this.inputs = {};
      this.web3 =
        web3 ||
        new Web3(
          'HTTP://127.0.0.1:7545'
          // 'wss://mainnet.infura.io/ws/v3/7d06294ad2bd432887eada360c5e1986'
        );
      this.gasPrice = gasPrice;
      this.ABI = null;
      this.contractMethods = [];
      this.selectedMethod = { inputs: [] };
      this.storeContractAddress = storeHandler || function () {};
      this.selectedMethodName = '';
      this.selectedMethodInputs = {};
      this.noInputs = false;
      this.selectedMethodInputValues = {};
      // ===========
      this.constructorABI = null;
      this.constructorInputs = {};
      this.txByteCode = null;
      this.contractsDeployed = [];
      this.noConstructorInputs = false;
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }

  clear(keepMethods) {
    // this.contractActive = false;
    // ===========
    this.constructorABI = null;
    this.constructorInputs = {};
    this.txByteCode = null;
    this.noConstructorInputs = false;
    if (!keepMethods) {
      this.address = '';
      this.inputs = {};
      this.ABI = null;
      this.contractMethods = [];
      this.selectedMethod = { inputs: [] };
      this.selectedMethodName = '';
      this.selectedMethodInputs = {};
      this.selectedMethodInputValues = {};
    }
  }

  updateGasPrice(gasPrice) {
    this.gasPrice = gasPrice;
  }

  get hasABI() {
    return this.ABI !== null || true;
  }

  get abiValid() {
    return this.hasABI && typeof this.ABI === 'object';
  }

  get byteCodeValid() {
    try {
      return !!this.txByteCode && this.txByteCode.substring(0, 2) === '0x';
    } catch (e) {
      return false;
    }
  }

  get contractActive() {
    return this.hasABI && this.address !== '';
  }

  get payableConstructor() {
    if (this.constructorABI) {
      return this.constructorABI.payable;
    }
    return false;
  }

  get canDeploy() {
    return (
      this.hasABI &&
      this.hasConstructorABI &&
      this.txByteCode !== null &&
      ((Object.values(this.constructorInputs).every(item => {
        return item.value !== null && item.valid;
      }) &&
        Object.values(this.constructorInputs).length > 0) ||
        this.noConstructorInputs)
    );
  }

  get hasConstructorABI() {
    if (this.constructorABI) {
      return Object.keys(this.constructorABI).length > 0;
    }
    return false;
  }

  get methodInputs() {
    if (this.selectedMethod) {
      return this.selectedMethodInputs;
    }
    return {};
  }
  get isMethodConstant() {
    return this.selectedMethod.constant;
  }
  get hasInputs() {
    return this.noInputs;
  }

  get contractMethodNames() {
    console.log('contractMethodNames', this.contractMethods); // todo remove dev item
    if (this.contractMethods.length > 0 && this.contractActive) {
      return this.contractMethods.reduce((acc, cur) => {
        acc.push(cur.name);
        return acc;
      }, []);
    }
    return [];
  }

  setStoreHandler(storeHandler) {
    this.storeContractAddress = storeHandler;
  }

  setSelectedMethodInputValue(name, value) {
    if (arguments.length > 2) {
      // console.log(this.selectedMethodInputs); // todo remove dev item
      for (let i = 0; i < arguments.length - 1; i = i + 2) {
        console.log(arguments[i], arguments[i + 1]); // todo remove dev item
        if (!this.selectedMethodInputs[arguments[i]])
          throw Error(`${arguments[i]} is not an expected input`);
        this.selectedMethodInputs[arguments[i]].value = arguments[i + 1];
      }
    } else {
      if (!this.selectedMethodInputs[name])
        throw Error(`${name} is not an expected input`);
      this.selectedMethodInputs[name].value = value;
    }

    // console.log(this.selectedMethodInputs); // todo remove dev item
  }

  isInputValid(name) {
    if (!this.selectedMethodInputs[name])
      throw Error(`${name} is not an expected input`);
    return this.selectedMethodInputs[name].valid;
  }

  setAbi(abi) {
    try {
      if (abi) {
        this.ABI = this.parseJSON(abi);
        this.processAbi(this.ABI);
        // console.log('setAbi', this.contractMethods); // todo remove dev item
      }
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }

  setContractAddress(address) {
    console.log(address); // todo remove dev item
    this.address = address;
  }

  parseJSON(json) {
    try {
      JSON.parse(json);
      return JSON.parse(json);
    } catch (e) {
      if (Array.isArray(json)) {
        return json;
      }
      return false;
    }
  }
  processAbi(jsonAbi) {
    try {
      if (jsonAbi !== '') {
        if (Array.isArray(jsonAbi)) {
          this.contractMethods = jsonAbi.filter(item => {
            if (item.type !== 'constructor' && item.constant !== undefined) {
              return item;
            }
          });
          this.contractMethodDetails = jsonAbi.reduce((acc, cur) => {
            if (cur.type !== 'constructor' && cur.constant !== undefined) {
              cur.result = cur.constant;
              acc[cur.name] = cur;
            }
            if (cur.type === 'constructor') {
              this.constructorABI = cur;
              this.abiConstructor();
            }
            return acc;
          }, {});
        } else {
          // this.resetDefaults();
          console.log('invalid abi'); // todo remove dev item
        }
      } else {
        console.log('processAbi error'); // todo remove dev item
      }
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }
  selectedFunction(methodName) {
    // todo make this and getting contract args similar to how a constructor is handled
    // todo remove using map and see constructor setup
    return new Promise((resolve, reject) => {
      console.log(`selectedFunction(${methodName})`); // todo remove dev item
      this.selectedMethodName = methodName;
      this.selectedMethodInputs = {};
      this.selectedMethodOutputs = {};
      const method = this.contractMethodDetails[methodName];
      if (!method)
        return reject(Error(`Selected method ${methodName} not found`));
      try {
        if (!method.hasOwnProperty('constant')) return;
        this.selectedMethod = method;
        this.selectedMethodInputs = this.selectedMethod.inputs.reduce(
          (acc, cur) => {
            console.log(cur.name); // todo remove dev item
            // this.selectedMethodInputValues.set(cur.name, null);
            const itemProxy = this.createTypeValidatingProxy(cur);
            itemProxy.value = null;
            itemProxy.result = null;
            acc[cur.name] = itemProxy;
            return acc;
          },
          {}
        );
        this.noInputs = this.selectedMethod.inputs.length === 0;
        this.selectedMethodOutputs = this.selectedMethod.outputs.reduce(
          (acc, cur, idx) => {
            // const name = cur.name == '' ? cur.name :
            // this.selectedMethodInputValues.set(cur.name, null);
            const itemProxy = this.createTypeValidatingProxy(cur);
            itemProxy.value = null;
            itemProxy.result = null;
            acc[idx.toString()] = itemProxy;
            return acc;
          },
          {}
        );
        this.selectedMethodName = methodName;
        if (method.constant === true && method.inputs.length === 0) {
          const contract = new this.web3.eth.Contract(
            [method],
            this.address.toLowerCase()
          );
          contract.methods[methodName]()
            .call({ from: this.userAddress.toLowerCase() })
            .then(res => {
              console.log(res); // todo remove dev item
              // if (this.selectedMethodInputs[methodName]) {
              //   this.selectedMethodInputs[methodName].value = res;
              //   this.selectedMethodInputs[methodName].result = res;
              // }
              if (Object.keys(this.selectedMethodOutputs).length === 1) {
                this.selectedMethodOutputs['0'].value = res;
              } else if (
                typeof res === 'object' &&
                Object.keys(this.selectedMethodOutputs).length > 1
              ) {
                Object.keys(res).forEach(key => {
                  if (this.selectedMethodOutputs[key]) {
                    this.selectedMethodOutputs[key].value = res[key];
                  }
                });
              }
              // this.selectedMethodInputs.result = res;
              resolve({
                inputs: this.selectedMethodInputs,
                outputs: this.selectedMethodOutputs
              });
            })
            .catch(e => {
              this.loading = false;
              reject(e);
              // eslint-disable-next-line
              console.error(e); // todo remove dev item
              // Toast.responseHandler(e, Toast.WARN);
            });
        } else {
          this.result = '';
          // this.selectedMethodInputs.result = null;
          resolve({
            inputs: this.selectedMethodInputs,
            outputs: this.selectedMethodOutputs
          });
        }
        this.loading = false;

        // =================== may no longer need
        // this.selectedMethod.inputs.forEach(input => {
        //   if (input.type === 'bool') {
        //     this.inputs[input.name] = false;
        //   }
        // });
      } catch (e) {
        // eslint-disable-next-line
        console.error(e);
      }
    });
  }
  abiConstructor() {
    try {
      this.constructorInputs = {};
      if (this.hasABI) {
        // console.log(this.ABI); // todo remove dev item
        if (!this.constructorABI.hasOwnProperty('inputs')) {
          this.ABI.forEach(item => {
            if (item.type === 'constructor') {
              this.constructorABI = item;
            }
          });
        }

        // Sets radio buttons to false due to vue reactivity
        if (
          this.constructorABI &&
          this.constructorABI.hasOwnProperty('inputs')
        ) {
          this.constructorABI.inputs.forEach(item => {
            const itemProxy = this.createTypeValidatingProxy(item);
            itemProxy.value = null;
            this.constructorInputs[item.name] = itemProxy;
          });
          if (this.constructorABI.inputs.length === 0) {
            this.noConstructorInputs = true;
          }
          // if (this.constructorABI.payable) {
          //   const itemProxy = this.createTypeValidatingProxy({
          //     internalType: 'uint256',
          //     name: 'value',
          //     type: 'uint256'
          //   });
          //   itemProxy.value = null;
          //   this.constructorInputs['value ETH'] = itemProxy;
          // }
        }
      }
      return this.constructorInputs;
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
      return {};
    }
  }
  deploy(withValue, keepMethods = false) {
    return new Promise((resolve, reject) => {
      try {
        console.log('canDeploy', this.canDeploy); // todo remove dev item
        if (!this.canDeploy) return Promise.reject();
        const rawTx = {};
        if (this.constructorABI.payable && withValue)
          rawTx.value = sanitizeHex(
            ethUnit.toWei(withValue, 'ether').toString(16)
          );
        else rawTx.value = '0x00';
        rawTx.data = this.txData();
        if (rawTx.data !== '0x') {
          this.sendTransaction(rawTx, keepMethods)
            .then(res => {
              resolve(res);
            })
            .catch(reject);
        }
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }
  get deployArgs() {
    const _deployArgs = [];
    if (this.constructorABI) {
      this.constructorABI.inputs.forEach(item => {
        if (item.type.includes('[') && item.type.includes(']')) {
          const inputs = this.constructorInputs.hasOwnProperty(item.name)
            ? this.constructorInputs[item.name].value.replace(/\s/g, '')
            : '';
          const arr = inputs.split(',');
          _deployArgs.push(arr);
        } else {
          _deployArgs.push(this.constructorInputs[item.name].value);
        }
      });
    }
    return _deployArgs;
  }
  setDeployArg(name, value) {
    console.log(name, value); // todo remove dev item
    this.constructorInputs[name].value = value;
  }
  setByteCode(txByteCode) {
    try {
      if (typeof txByteCode === 'object') {
        if (txByteCode.hasOwnProperty('object'))
          this.txByteCode =
            txByteCode.object.substring(0, 2) === '0x'
              ? txByteCode.object
              : '0x' + txByteCode.object;
      } else if (typeof txByteCode === 'string') {
        this.txByteCode =
          txByteCode.substring(0, 2) === '0x' ? txByteCode : '0x' + txByteCode;
      } else {
        this.txByteCode = null;
      }
    } catch (e) {
      this.txByteCode = null;
    }
  }
  txData() {
    if (this.canDeploy) {
      // console.log(JSON.parse(this.ABI)); // todo remove dev item
      return new this.web3.eth.Contract(this.ABI)
        .deploy({ data: this.txByteCode, arguments: this.deployArgs })
        .encodeABI();
    }

    return '0x';
  }
  async estimateGas(params) {
    return this.web3.eth.estimateGas(params).catch(err => {
      // Toast.responseHandler(err, Toast.WARN);
      // eslint-disable-next-line
      console.error(err); // todo replace with proper error
    });
  }
  async getNonce(address) {
    return this.web3.eth.getTransactionCount(address);
  }
  getGasPrice() {
    return sanitizeHex(ethUnit.toWei(this.gasPrice, 'gwei').toString(16));
  }
  sendTransaction(tx, keepMethods = false) {
    let coinbase;
    return this.web3.eth
      .getCoinbase()
      .then(() => {
        coinbase = this.userAddress; // todo use actual result from getCoinbase if correctly returns user address
        return Promise.all([
          this.estimateGas({ from: coinbase, ...tx }),
          this.getNonce(coinbase)
        ]);
      })

      .then(results => {
        const _tx = new Transaction({
          from: coinbase,
          nonce: results[1],
          gasPrice: this.getGasPrice(),
          gasLimit: sanitizeHex(new BigNumber(results[0]).toString(16)),
          ...tx
        });
        const json = _tx.toJSON(true);
        delete json.to;
        json.from = coinbase;
        const contractAddr = bufferToHex(
          generateAddress(toBuffer(coinbase), toBuffer(results[1]))
        );
        this.address = contractAddr;
        this.storeContractAddress(contractAddr);
        this.contractsDeployed.push(contractAddr);
        this.clear(keepMethods);
        return this.web3.eth.sendTransaction(json);
      })
      .catch(err => {
        throw err;
      });
  }
  async write(txValue) {
    let value;
    const web3 = this.web3;
    const contract = new web3.eth.Contract(
      [this.selectedMethod],
      this.address.toLowerCase()
    );
    if (txValue) {
      value = sanitizeHex(ethUnit.toWei(txValue, 'ether').toString(16));
    } else {
      value = 0;
    }
    this.loading = true;
    if (this.selectedMethod.constant === true) {
      console.log('CONSTANT'); // todo remove dev item

      return contract.methods[this.selectedMethod.name](...this.contractArgs)
        .call({ from: this.userAddress.toLowerCase() })
        .then(res => {
          const results = {};
          if (Object.keys(this.selectedMethodOutputs).length === 1) {
            const key = '0'
            results[key] = {};
            results[key].value = res;
            results[key].name = this.selectedMethodOutputs[key].name;
            results[key].type = this.selectedMethodOutputs[key].type;
          } else if (
            typeof res === 'object' &&
            Object.keys(this.selectedMethodOutputs).length > 1
          ) {
            Object.keys(res).forEach(key => {
              if (this.selectedMethodOutputs[key]) {
                results[key] = {};
                results[key].value = res;
                results[key].name = this.selectedMethodOutputs[key].name;
                results[key].type = this.selectedMethodOutputs[key].type;
                this.selectedMethodOutputs[key].value = res[key];
              }
            });
          }
          console.log('res', res); // todo remove dev item
          // if (Array.isArray(res)) {
          //   this.selectedMethodOutputs.result = JSON.stringify(res);
          // } else this.selectedMethodOutputs.result = res;
          // this.loading = false;
          return { outputs: results };
        })
        .catch(e => {
          this.loading = false;
          // eslint-disable-next-line
          console.error(e); // todo remove dev item
          // Toast.responseHandler(e, false);
        });
    }
    const nonce = await web3.eth.getTransactionCount(
      this.userAddress.toLowerCase()
    );
    let errored = false;
    const gasLimit = await contract.methods[this.selectedMethod.name](
      ...this.contractArgs
    )
      .estimateGas({
        from: this.userAddress.toLowerCase(),
        value: value
      })
      .then(res => {
        return res;
      })
      .catch(e => {
        this.loading = false;
        // eslint-disable-next-line
          console.error(e); // todo remove dev item
        // Toast.responseHandler(e, Toast.ERROR);
        errored = true;
      });
    if (!errored) {
      const data = contract.methods[this.selectedMethod.name](
        ...this.contractArgs
      ).encodeABI();

      const raw = {
        from: this.userAddress.toLowerCase(),
        gas: gasLimit,
        nonce: nonce,
        gasPrice: Number(ethUnit.toWei(this.gasPrice, 'gwei')),
        value: value,
        to: this.address.toLowerCase(),
        data: data
      };
      console.log(raw); // todo remove dev item
      this.loading = false;
      return web3.eth.sendTransaction(raw).catch(err => {
        // eslint-disable-next-line
          console.error(err); // todo remove dev item
        // Toast.responseHandler(err, Toast.ERROR);
      });
    }
  }

  get contractArgs() {
    try {
      // const _contractArgs = [];
      console.log(this.selectedMethod); // todo remove dev item
      if (this.selectedMethod) {
        this.inputs = this.selectedMethodInputs;
        return this.selectedMethod.inputs.reduce((_contractArgs, item) => {
          const value = this.selectedMethodInputs[item.name].value;
          console.log(this.selectedMethodInputs, item.name, value); // todo remove dev item
          if (item.type.includes('[]')) {
            const parsedItem = Contracts.formatInput(value);
            _contractArgs.push(parsedItem);
          } else if (item.type === 'address') {
            _contractArgs.push(value.toLowerCase().trim());
          } else if (item.includes === 'uint') {
            const number = new BigNumber(value.trim());
            _contractArgs.push(number.toFixed());
          } else {
            _contractArgs.push(value);
          }
          return _contractArgs;
        }, []);
      }
      return [];
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
      throw e;
    }
  }
  createTypeValidatingProxy(item) {
    return new Proxy(item, {
      set: (obj, prop, value) => {
        if (prop === 'value' && value !== null) {
          if (
            Contracts.isContractArgValid(
              value,
              Contracts.getType(obj.type).solidityType
            )
          ) {
            obj.valid = true;
          } else {
            obj.valid = false;
          }
        } else if (prop === 'value' && value === null) {
          obj.valid = false;
        }
        obj[prop] = value;

        // The default behavior to store the value
        // obj[prop] = value;

        // Indicate success
        return true;
      }
    });
  }

  static isContractArgValid(value, solidityType) {
    try {
      if (!value) value = '';
      if (solidityType.includes('[]')) {
        const parsedValue = Array.isArray(value) ? value : stringToArray(value);
        const type = solidityType.replace('[]', '');
        for (const parsedItem of parsedValue) {
          if (!Contracts.isContractArgValid(parsedItem, type)) return false;
        }
        return true;
      }
      if (solidityType.includes(uint) || solidityType.includes(int))
        return value !== '' && !isNaN(value) && isInt(value);
      if (solidityType === address) return utils.isAddress(value);
      if (solidityType === string) return true;
      if (solidityType.includes(bytes))
        return value.substr(0, 2) === '0x' && validateHexString(value);
      if (solidityType === bool)
        return typeof value === typeof true || typeof value === typeof false;
      return false;
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }
  static getType(inputType) {
    try {
      if (!inputType) inputType = '';
      if (inputType.includes('[]')) {
        return { type: 'string', solidityType: `${inputType}` };
      }
      if (inputType.includes(uint))
        return { type: 'number', solidityType: uint };
      if (inputType.includes(address))
        return { type: 'text', solidityType: address };
      if (inputType.includes(string))
        return { type: 'text', solidityType: string };
      if (inputType.includes(bytes))
        return { type: 'text', solidityType: bytes };
      if (inputType.includes(bool))
        return { type: 'radio', solidityType: bool };
      return { type: 'text', solidityType: string };
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }
  static formatInput(str) {
    try {
      if (str[0] === '[') {
        return JSON.parse(str);
      }
      const newArr = str.split(',');
      return newArr.map(item => {
        return item.replace(' ', '');
      });
    } catch (e) {
      // Toast.responseHandler(e, Toast.ERROR);
    }
  }
  getEntireBal() {
    return '20000';
  }
}
