import Vue from 'vue'
import Router from 'vue-router'
import Bookmark from '@/components/home/Bookmark'
import AddBookmark from '@/components/home/AddBookmark'
import SharedBookmark from '@/components/home/SharedBookmark'
import { Hub } from "@aws-amplify/core"
import Auth from "@aws-amplify/auth"
import store from '../store/index.js'

Vue.use(Router)

let user;

getUser().then((user) => {
    if (user) {
        router.push({path: '/'});
    }
});

function getUser() {
    return Auth.currentAuthenticatedUser().then((data) => {
        if (data && data.signInUserSession) {
            store.commit('setUser', data);
            return data;
        }
    }).catch(() => {
        store.commit('setUser', null);
        return null;
    });
}

Hub.listen("auth", async (data) => {
    if (data.payload.event === 'signOut'){
        console.log("router sign out")
        router.push({path: '/login'});
    } else if (data.payload.event === 'signIn') {
      console.log("router signIn")
        user = await getUser();
        router.push({path: '/'});
    }
});

 const routes = [
    {
      path: '/',
      name: 'Bookmark',
      component: Bookmark
    },
    {
      path: '/addbookmark',
      name: 'AddBookmark',
      component: AddBookmark
    },
    {
      path: '/sharebookmark',
      name: 'SharedBookmark',
      component: SharedBookmark
    }
  ]

const router = new Router({
  mode: 'history',
  routes: routes
})

router.beforeResolve(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        user = await getUser();
        if (!user) {
            return next();
        }
        return next()
    }
    return next()
});

export default router