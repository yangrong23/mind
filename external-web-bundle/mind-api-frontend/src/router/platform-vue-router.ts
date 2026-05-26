import { createRouter, createWebHistory } from 'vue-router'
import { platformRouteRecords } from './platform-routes'

/** Vue Router for /platform/* — mounted inside React shell; auth enforced by React guards */
export function createPlatformVueRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: platformRouteRecords,
  })
}
