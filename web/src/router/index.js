import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/views/login"
import Chatroom from "@/views/chatroom.vue"

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/chatroom',
    name: 'chatroom',
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