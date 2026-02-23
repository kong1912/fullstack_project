// Fn 3.5 / Fn 1.2 — MHW-DB External API helpers (Asynchronous JS + Hooks)
import axios from 'axios'

const MHW_BASE = 'https://mhw-db.com'
const mhwAxios = axios.create({ baseURL: MHW_BASE, timeout: 8000 })

// --- Monsters ---
export const fetchMonsters   = (params = {}) => mhwAxios.get('/monsters', { params })
export const fetchMonsterById = (id)         => mhwAxios.get(`/monsters/${id}`)

// --- Weapons ---
export const fetchWeapons    = (params = {}) => mhwAxios.get('/weapons', { params })
export const fetchWeaponById = (id)          => mhwAxios.get(`/weapons/${id}`)

// --- Armor ---
export const fetchArmor      = (params = {}) => mhwAxios.get('/armor', { params })
export const fetchArmorById  = (id)          => mhwAxios.get(`/armor/${id}`)

// --- Skills ---
export const fetchSkills     = (params = {}) => mhwAxios.get('/skills', { params })

// --- Items ---
export const fetchItems      = (params = {}) => mhwAxios.get('/items', { params })

export default mhwAxios
