<template>
	<div id="app">
    	<Navbar />
		<amplify-authenticator class="center">
		<div id="amplify-signout">
			<amplify-sign-out></amplify-sign-out>
		</div>
    	<router-view />
		</amplify-authenticator>
    	<Footer />
  	</div>
</template>

<script>
import Navbar from '@/components/layout/Navbar'
import Body from './components/layout/Body';
import Footer from '@/components/layout/Footer'
import { onAuthUIStateChange } from '@aws-amplify/ui-components';

export default {
	name: 'App',
	components: {
    	Navbar,
    	Footer
	},
	created() {
		console.log("App.vue created")
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
    });
  },
  data() {
    return {
      user: undefined,
      authState: undefined,
      unsubscribeAuth: undefined,
    };
  },
  destroyed() {
  	console.log("App.vue destroyed")
    this.unsubscribeAuth();
  },
}
</script>

<style>
#app {
  margin: 5px auto;
  border-top: 10px;
}
#amplify-signout {
  width: 100px;
  margin: 5px auto;
}
</style>
