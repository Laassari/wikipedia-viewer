const htmlArticlesWrapper = document.querySelector('.wrapper')
const searchButton = document.getElementById('search')
const searchInput = document.getElementById('searchbox')

searchButton.addEventListener('click', _ => handleSearch (searchInput.value))

searchInput.addEventListener('keypress', e => {
  if (e.keyCode == 13) handleSearch (searchInput.value)
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
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
}
function renderFullArticle(articleObj) {
  //TODO: implement
}

function requestFullArticle() {
  //TODO: implement (ie: fetch)  
}

//get url for a one line description
function getDescriptionUrl(term) {
  const url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&origin=*&gsrsearch='
  return `${url}${term}`
}