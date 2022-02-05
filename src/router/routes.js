const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '/', redirect: '/pixel-art'
      },
      { 
        path: '/csv-verarbeitung', 
        component: () => import('src/pages/PageCSVVerarbeitung.vue'),
        name: 'csv_verarbeitung'
      },
      { 
        path: '/meme-generator', 
        component: () => import('pages/PageMemeGenerator.vue'),
        name: 'meme_generator'
      },
      { 
        path: '/pixel-art', 
        component: () => import('src/pages/PagePixelArt.vue'),
        name: 'pixel_art'
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
