import {
    createConfig,
    http,
    cookieStorage,
    createStorage
} from 'wagmi'
import { filecoinCalibration, mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
    chains: [mainnet, sepolia, filecoinCalibration],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [filecoinCalibration.id]: http()
    },
})