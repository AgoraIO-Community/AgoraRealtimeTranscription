import Vue from 'vue'
import Router from 'vue-router'
import Home from "@/views/Home.vue"
import Chatroom from "@/views/Chatroom.vue"

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: Home,
  },
  {
    path: '/chatroom',
    name: 'Chatroom',
    component: Chatroom,
  },
]

const router = new Router({
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

export default router
