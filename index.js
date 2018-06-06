const htmlArticlesWrapper = document.querySelector('.wrapper')
const searchButton = document.getElementById('search')
const searchInput = document.getElementById('searchbox')
const fullArticleWrapper = document.querySelector('.full-article')
//vars related to the full article
const hero = fullArticleWrapper.querySelector('.hero')
const headding = fullArticleWrapper.querySelector('.hero h1')
const fullArticle = fullArticleWrapper.querySelector('article')
const backButton = document.querySelector('.back')

searchButton.addEventListener('click', _ => handleSearch (searchInput.value))

searchInput.addEventListener('keypress', e => {
  if (e.keyCode == 13) handleSearch (searchInput.value)
})

htmlArticlesWrapper.addEventListener('click', e => {
  if (e.target.nodeName == "ARTICLE" || e.target.closest('.wrapper article')) {
    //an article or a child is the target
    const title = e.target.closest('.wrapper article').dataset.title
    requestFullArticle(title)
      .then(article => renderFullArticle(article))
  }
}) 

backButton.addEventListener('click', () => { //hide the full article
  fullArticleWrapper.classList.remove('full-article-expand')
})
/* you can use fetch but add &origin=* to avoid "No 'Access-Control-Allow-Origin'" errors */
function handleSearch(searchTerm) {
  if (searchTerm.trim() == "") return
  
  fetch(getDescriptionUrl(searchTerm.trim()))
  .then(data => data.json())
  .then(data => {
    if (!data.query) { //no results are returned
      htmlArticlesWrapper.innerHTML = `<h1 class="center">No results to show! 😞</h1>`
      return
    }
    renderArticles(data.query.pages)
  })
  .catch(err => { htmlArticlesWrapper.innerHTML = `<h1 class="center">Network error occured! 🤒</h1>`})
}

function renderArticles(pagesObj) {
  htmlArticlesWrapper.innerHTML = ''
  for (const i in pagesObj) {
    const article = document.createElement('article')
    article.dataset.title = pagesObj[i].title
    article.innerHTML = `<h1>${pagesObj[i].title}</h1>
    <img src="${!!pagesObj[i].thumbnail? pagesObj[i].thumbnail.source: ''}"/>
    <p>${pagesObj[i].extract}
    <span><a href="${getArticleUrlById(pagesObj[i].pageid)}" class="new-tab" target="_blank">read the full article</a></span>
    </p>
    `
    htmlArticlesWrapper.appendChild(article)
  }
}

function getArticleUrlById(id){
  return `https://en.wikipedia.org/?curid=${id}`
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
                          url(${ articleObj.thumbnail || "default.png"})`
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
    return {
      title,
      thumbnail,
      extract
    }
  })
}

//get url for a one line description
function getDescriptionUrl(term) {
  const url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch='
  return `${url}${term}`
}