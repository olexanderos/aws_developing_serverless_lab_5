<template>
    <div class="navbar">
        <nav class="nav-extended" orange darken-2>
            <div class="nav-content">
                <router-link to="/">
                    <span class="nav-title" >Bookmark App</span>
                        <a href="" class="center">
                            <router-link to="/sharebookmark">
                                <ul id="nav-mobile" class="bold right hide-on-med-and-down">
                                    <li><a href="">Shared Bookmarks</a></li>
                                </ul>  
                            </router-link>
                        </a>
                        <a href="" class="btn-floating btn-large halfway-fab waves-effect waves-light green">
                        <router-link to="/addbookmark">
                            <i class="material-icons">add</i>
                        </router-link>
                        </a>
                        </router-link>
            </div>
        </nav>  
    </div>
</template>

<script>
export default {
    name: 'Navbar',
    data(){
        return {

        }
    },
    methods: {
        logout() {
            
            }
        }
    }
</script>
<style>
.navbar{
    background-color: orangered;
}
.navbar .nav-title{
    padding: 0 20px 10px;
    background-color: grey !important;
}

</style>