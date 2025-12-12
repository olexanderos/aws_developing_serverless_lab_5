<template>
  <div class="row">
    <div class="center">
      <div class="index container">
        <h2 class="indigo-text">Shared Bookmark Collection</h2>
          <table>
        <thead>
          <tr>
              <th>Name</th>
              <th>Description</th>
              <th>URL</th>
          </tr>
        </thead>
        <tbody v-for="bookmark in bookmarks" :key="bookmark.id">
          <tr>
            <td>{{ bookmark.name}}</td>
            <td>{{ bookmark.description}}</td>
            <td>{{ bookmark.bookmarkUrl}}<a href="#!" class="secondary-content right"><i class="material-icons" @click="deleteBookmark(bookmark.id)">delete</i></a></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script>

import { API } from '@aws-amplify/api'
import { Auth } from '@aws-amplify/auth';

export default {
  name: 'Bookmark',
  data () {
    return {
          apiName: 'Bookmarking App',
          path: '/bookmarks/',
          id: null,
          slug: null,
          description: null,
          link: null,
          shared: null,
          bookmarkUrl: null,
          bookmarks: [],
          username: null
        }
      },
      methods: {
      async deleteBookmark(id){
      // delete doc from dynamodb
      await API.del(this.apiName, this.path+id)
      .then(() => {
        console.log(this.bookmarks)
        this.bookmarks = this.bookmarks.filter( bookmark => {
           return bookmark.id != id
        })
      }).catch(err => {
        console.log(err)
      })
      }
      },
      async created(){
        let results = await Auth.currentUserInfo()
        console.log(`Done: ${JSON.stringify(results.username)}`)
        this.username = results.username
        console.log(this.username)
        await API.get(this.apiName, this.path, {
          queryStringParameters: {user : this.username}
        })
        .then(response => {
          console.log(response)
          response.forEach(element => {
          let bookmark = element
          if (bookmark.username == this.username && bookmark.shared == true){
            this.bookmarks.push(bookmark)
          }
          else {}
          });
          
        }).catch(err => {
        console.log(err)
      })
      }
    }
  
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.index{
  display: grid;
  padding: 20px;
  inline-size: 1fr 1fr 1fr;
}
.index h2{
  font-size: 1.8em;
  text-align: center;
  margin-top: 0px;
}
.index .delete{
  position: absolute;
  top: 4px;
  right: 4px;
  cursor: pointer;
  color: #aaa;
  font-size: 1.4em;
}
.index h4{
  font-size: 1.4em;
  text-align: center;
  margin-top: 0px;
  font-variant: small-caps;
}
.index .collection{
  width: 1000px;
  font-size: 1.25em ;
}
.index .collection-item{
  font-variant: initial;
  align-self: center;
}
</style>
