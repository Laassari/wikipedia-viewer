/*global idb*/
const htmlArticlesWrapper = document.querySelector('.wrapper')
const searchButton = document.getElementById('search')
const searchInput = document.getElementById('searchbox')
const fullArticleWrapper = document.querySelector('.full-article')
//vars related to the full article
const hero = fullArticleWrapper.querySelector('.hero')
const headding = fullArticleWrapper.querySelector('.hero h1')
const fullArticle = fullArticleWrapper.querySelector('article')
const backButton = document.querySelector('.back')
let dbPromise //indexedDB
let articleObject
const offlineSwitch = document.getElementById('offline-switch')

searchButton.addEventListener('click', () => handleSearch (searchInput.value))

searchInput.addEventListener('keypress', e => {
  if (e.keyCode == 13) handleSearch (searchInput.value)
})

htmlArticlesWrapper.addEventListener('click', e => {
  if (e.target.nodeName == 'ARTICLE' || e.target.closest('.wrapper article')) {
    //an article or a child is the target
    const title = e.target.closest('.wrapper article').dataset.title
    requestFullArticle(title)
      .then(article => renderFullArticle(article))
  }
}) 

backButton.addEventListener('click', () => { //hide the full article
  fullArticleWrapper.classList.remove('full-article-expand')
})

// Service worker stuff 💪 💪
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('success registeration'))/*eslint no-console: "off"*/
    .catch(err => console.log(err))
}

/* you can use fetch but add &origin=* to avoid "No 'Access-Control-Allow-Origin'" errors */
function handleSearch(searchTerm) {
  if (searchTerm.trim() == '') return
  
  fetch(getDescriptionUrl(searchTerm.trim()))
  .then(data => data.json())
  .then(data => {
    if (!data.query) { //no results are returned
      htmlArticlesWrapper.innerHTML = '<h1 class="center">No results to show! 😞</h1>'
      return
    }
    renderArticles(data.query.pages)
  })
  .catch(() => { htmlArticlesWrapper.innerHTML = '<h1 class="center">Network error occured! 🤒</h1>'})
}

function renderArticles(pagesObj) {
  htmlArticlesWrapper.innerHTML = ''
  for (const i in pagesObj) {
    const article = document.createElement('article')
    article.dataset.title = pagesObj[i].title
    article.innerHTML = `<h1>${pagesObj[i].title}</h1>
    <img src="${pagesObj[i].thumbnail? pagesObj[i].thumbnail.source: ''}"/>
    <p>${pagesObj[i].extract}
    </p>
    `
    htmlArticlesWrapper.appendChild(article)
  }
}


function getFullArticleByTitle (title) {
  //this url gets little results but with images
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
}
function getFullArticleByTitleWithImages (title) {
  return `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&origin=*&titles=${title}`
}
function renderFullArticle(articleObj={}) {
  hero.style.backgroundImage = `linear-gradient( #5454544f, #000000ab ), 
                          url(${ articleObj.thumbnail || 'default.png'})`
  headding.textContent = articleObj.title
  fullArticle.innerHTML = articleObj.extract

  fullArticleWrapper.classList.add('full-article-expand') //finally show the content

}

function requestFullArticle(title) {
  return Promise.all([  fetch(getFullArticleByTitle(title)),   fetch(getFullArticleByTitleWithImages(title))])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(jsn => {
    const title = jsn[0].title
    const thumbnail = jsn[0].thumbnail && jsn[0].thumbnail.source
    const extract =  Object.values(jsn[1].query.pages)[0].extract
    const articleObj = {
      title,
      thumbnail,
      extract
    }
    articleObject = articleObj
    return articleObj
  })
}

//get url for a one line description
function getDescriptionUrl(term) {
  const url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch='
  return `${url}${term}`
}

//create a database for articles
dbPromise = idb.open('articles', 1, upgrade => {
  upgrade.createObjectStore('article')
})

offlineSwitch.addEventListener('click', event => {
  if (!articleObject.title) return //data isn't retrieved yet

  const checked = event.target.checked
  if (checked) { //add the article to indexedDB
    saveAricle(articleObject)
  } else {
    removeArticle(articleObject)
  }
})

//save to indexedDB
function saveAricle(article) {
 return dbPromise.then(db => {
    const tx = db.transaction('article', 'readwrite')
    const store = tx.objectStore('article')
    store.put(article, article.title)
  })
}

//remove from indexedDB store
function removeArticle(article) {
  return dbPromise.then(db => {
    const tx = db.transaction('article', 'readwrite')
    const store = tx.objectStore('article')
    store.delete(article.title)
  })
}