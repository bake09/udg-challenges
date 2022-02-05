<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-capitalize">
          {{ formatedRouteName }}
        </q-toolbar-title>

        <div class="text-italic">
          Project for 
          <q-avatar rounded size="md" class="q-ml-sm">
            <img src="logo_udg.png">
          </q-avatar>
        </div>
      </q-toolbar>
    </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        elevated
        class="q-page-container"
      >
      
      <q-img class="absolute-top" src="drawerImage.jfif" style="height: 150px">
        <div class="row col flex items-center justify-between full-width">
          <span>Des hod'd Hand ond Fuaß :)</span>
          <q-icon name="las la-heart" color="red-3" class=""/>
          <!-- <span>'Brobiera goh'd iebr schdud'iera :)</span> -->
        </div>  
        <div class="absolute-bottom bg-transparent">
          <div class="text-weight-bold">Başar Ökke</div>
          <a target="_blank" href="https://github.com/bake09" class="mylink">@github.com/bake09</a>
        </div>
      </q-img>

      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px;">
        <q-list>
          <q-item
            v-for="(link, index) in linksList"
            :key="index"
            clickable
            :to="link.link"
          >
            <q-item-section
              v-if="link.icon"
              avatar
            >
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',
  data() {
    return {
      leftDrawerOpen: false,
      linksList: [
        {
          title: 'Pixel Art',
          caption: 'Probeaufgabe 3',
          icon: 'las la-pencil-ruler',
          link: { name: 'pixel_art'}
        },
        {
          title: 'Meme Generator',
          caption: 'Probeaufgabe 2',
          icon: 'las la-portrait',
          link: { name: 'meme_generator'}
        },
        {
          title: 'CSV Verarbeitung',
          caption: 'Probeaufgabe 1',
          icon: 'las la-file-csv',
          link: { name: 'csv_verarbeitung'}
        }
      ]
    }
  },
  computed: {
    formatedRouteName(){
      if(this.$route.path != '/'){
        return this.$route.name.replace("_", " ");
      }else{
        return "Willkommen"
      }
    }
  },
  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen
    }
  }
}
</script>

<style scoped>
.q-item.q-router-link--active, .q-item--active {
  color: var(--q-primary);
  color: white;
  background: #5a5a5a;
}
.mylink {
  color: white;
  text-decoration: none;
}
</style>