import { seedLocalStorage } from './seed'
import { installRemoteStorageSync, pushLocalStorageToApi, syncLocalStorageFromApi } from './storageSync'

export async function initializeStorage() {
  await syncLocalStorageFromApi()
  seedLocalStorage()
  installRemoteStorageSync()
  await pushLocalStorageToApi()
}
