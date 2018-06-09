const cacheName = 'wiki-1'
const filesToCache = [
  '/',
  'style.css',
  'index.js',
  'default.png'
]

addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  )
})

addEventListener('fetch', event => { //return a copy from the cache or fire a new request
  event.respondWith(
    caches.match(event.request)
    .then(res => {
      if (res) return res
      else {
        return fetch(event.request)
          .then(res => {
            return caches.open(cacheName)
              .then(cache => {
                cache.put(event.request.url, res.clone()) //save the response for future
                return res // return the fetched data
              })
          })
      }
    })
  )
})