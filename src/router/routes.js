import LandingPageView from '@/views/LandingPageView';
import Home from '@/views/LandingPageView/Home';

import CreateWalletDashboard from '@/views/CreateWalletView/CreateWalletDashboard';
import CreateWalletSoftware from '@/views/CreateWalletView/Software';
import CreateWalletMewWallet from '@/views/CreateWalletView/MewWallet';
import CreateWalletKeystore from '@/views/CreateWalletView/KeystoreFile';
import CreateWalletMnemonic from '@/views/CreateWalletView/MnemonicPhrase';

import AccessWalletView from '@/views/AccessWalletView';
import AccessWalletHardwareWallets from '@/views/AccessWalletView/containers/HardwareWallets';

import AccessWalletBrowserExtention from '@/views/AccessWalletView/containers/BrowserExtention';
import AccessWalletBrowserExtentionInstall from '@/views/AccessWalletView/containers/BrowserExtention/container/InstallExtention';
import AccessWalletBrowserExtentionAccess from '@/views/AccessWalletView/containers/BrowserExtention/container/AccessExtention';

import AccessWalletMobileApps from '@/views/AccessWalletView/containers/MobileApps';

import AboutUsCompany from '@/views/AboutUsView/CompanyContainer';
import AboutUsTeam from '@/views/AboutUsView/TeamContainer';

import HowItWorks from '@/views/LandingPageView/HowItWorks';
import MoreActions from '@/views/LandingPageView/MoreActions';
import BuyHardwareWallet from '@/views/LandingPageView/BuyHardwareWallet';

import Wallet from '@/views/WalletView';
import Dashboard from '@/views/DashboardView';

import Send from '@/containers/SendContainer';
import SendTX from '@/containers/SendContainer/SendTX';
import SendOffline from '@/containers/SendContainer/SendOffline';
import NFTManager from '@/containers/SendContainer/NFTManager';

import Swap from '@/containers/SwapContainer';

import Dapps from '@/containers/DappsContainer';
import DappsCenter from '@/containers/DappsContainer/DappsCenter';
import Trending from '@/containers/DappsContainer/Trending';
import NewDapps from '@/containers/DappsContainer/NewDapps';
import ENSManager from '@/containers/DappsContainer/ENSManager';
import MakerDAO from '@/containers/DappsContainer/MakerDAO';
import Aave from '@/containers/DappsContainer/Aave';
import Ambrpay from '@/containers/DappsContainer/Ambrpay';
import UnstoppableDomain from '@/containers/DappsContainer/UnstoppableDomain';

import Contract from '@/containers/ContractContainer';
import DeployContract from '@/containers/ContractContainer/DeployContract';
import InteractWithContract from '@/containers/ContractContainer/InteractWithContract';

import SignMessage from '@/containers/SignMessageContainer';

const routes = [
  {
    path: '/',
    component: LandingPageView,
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'how-it-works',
        name: 'HowItWorks',
        component: HowItWorks,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'more-actions',
        name: 'MoreActions',
        component: MoreActions,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'buy-hardware-wallet',
        name: 'BuyHardwareWallet',
        component: BuyHardwareWallet,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'about-us/company',
        name: 'AboutUsCompany',
        component: AboutUsCompany,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'about-us/team',
        name: 'AboutUsTeam',
        component: AboutUsTeam,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'create-wallet',
        name: 'HomeCreateWallet',
        component: CreateWalletDashboard,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'create-wallet/software',
        name: 'HomeCreateWalletSoftware',
        component: CreateWalletSoftware,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'create-wallet/mewwallet',
        name: 'HomeCreateWalletMewWallet',
        component: CreateWalletMewWallet,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'create-wallet/keystore',
        name: 'HomeCreateWalletKeystore',
        component: CreateWalletKeystore,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'create-wallet/mnemonic',
        name: 'HomeCreateWalletMnemonic',
        component: CreateWalletMnemonic,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet',
        name: 'HomeAccessWallet',
        component: AccessWalletView,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet/hardware',
        name: 'AccessWalletHardwareWallets',
        component: AccessWalletHardwareWallets,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet/browser-extention',
        name: 'AccessWalletBrowserExtention',
        component: AccessWalletBrowserExtention,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet/browser-extention/install',
        name: 'AccessWalletBrowserExtentionInstall',
        component: AccessWalletBrowserExtentionInstall,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet/browser-extention/access',
        name: 'AccessWalletBrowserExtentionAccess',
        component: AccessWalletBrowserExtentionAccess,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'access-wallet/mobile-apps',
        name: 'AccessWalletMobileApps',
        component: AccessWalletMobileApps,
        meta: {
          requiresAuth: false
        }
      }
    ]
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet,
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'send',
        name: 'Send',
        component: Send,
        meta: {
          requiresAuth: false
        },
        children: [
          {
            path: 'sendtx',
            name: 'SendTX',
            component: SendTX,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'send-offline',
            name: 'SendOffline',
            component: SendOffline,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'nft-manager',
            name: 'NFTManager',
            component: NFTManager,
            meta: {
              requiresAuth: false
            }
          }
        ]
      },
      {
        path: 'swap',
        name: 'Swap',
        component: Swap,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'dapps',
        name: 'Dapps',
        component: Dapps,
        meta: {
          requiresAuth: false
        },
        children: [
          {
            path: 'dapps-center',
            name: 'DappsCenter',
            component: DappsCenter,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'trending',
            name: 'Trending',
            component: Trending,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'new-dapps',
            name: 'NewDapps',
            component: NewDapps,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'ens-manager',
            name: 'ENSManager',
            component: ENSManager,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'maker-dao',
            name: 'MakerDAO',
            component: MakerDAO,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'aave',
            name: 'Aave',
            component: Aave,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'ambrpay',
            name: 'Ambrpay',
            component: Ambrpay,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'unstoppable-domain',
            name: 'UnstoppableDomain',
            component: UnstoppableDomain,
            meta: {
              requiresAuth: false
            }
          }
        ]
      },
      {
        path: 'contract',
        name: 'Contract',
        component: Contract,
        meta: {
          requiresAuth: false
        },
        children: [
          {
            path: 'deploy',
            name: 'DeployContract',
            component: DeployContract,
            meta: {
              requiresAuth: false
            }
          },
          {
            path: 'interact',
            name: 'InteractWithContract',
            component: InteractWithContract,
            meta: {
              requiresAuth: false
            }
          }
        ]
      },
      {
        path: 'sign',
        name: 'SignMessage',
        component: SignMessage,
        meta: {
          requiresAuth: false
        }
      }
    ]
  }
];

export default routes;