// Adds a "Reels" nav entry that opens the packaged plugin UI
const PLUGIN_NAME = 'stash-reels'
const BUTTON_ID = 'stash-reels-nav'
const PLUGIN_PATH = `/plugin/${PLUGIN_NAME}/assets/app/`
const ICON = `<svg class="svg-inline--fa fa-icon nav-menu-icon d-block d-xl-inline mb-2 mb-xl-0" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="film" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M488 64h-8v48h8c13.3 0 24-10.7 24-24S501.3 64 488 64zm0 144h-8v96h8c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24zm0 192h-8v48h8c13.3 0 24-10.7 24-24s-10.7-24-24-24zM32 64c-13.3 0-24 10.7-24 24s10.7 24 24 24h8V64H32zm0 144c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8v-96h-8zm0 192c-13.3 0-24 10.7-24 24s10.7 24 24 24h8v-48h-8zM448 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM192 400H96v-64h96v64zm0-128H96v-64h96v64zm0-128H96V80h96v64zm224 256H224v-64h192v64zm0-128H224v-64h192v64zm0-128H224V80h192v64z"/></svg>`

function createButton() {
  const wrapper = document.createElement('div')
  wrapper.id = BUTTON_ID
  wrapper.dataset.rbEventKey = PLUGIN_PATH
  wrapper.className = 'col-4 col-sm-3 col-md-2 col-lg-auto nav-link'
  wrapper.innerHTML = `
    <a href="${PLUGIN_PATH}" class="minimal p-4 p-xl-2 d-flex d-xl-inline-block flex-column justify-content-between align-items-center btn btn-primary">
      ${ICON}
      <span>Reels</span>
    </a>
  `
  return wrapper
}

function addButton() {
  if (document.getElementById(BUTTON_ID)) {
    return
  }
  const navLinks = document.querySelectorAll('.nav-link')
  if (!navLinks.length) {
    return
  }
  const container = navLinks[0].parentElement
  if (!container) {
    return
  }
  container.appendChild(createButton())
}

function init() {
  addButton()
  const observer = new MutationObserver(() => {
    if (!document.getElementById(BUTTON_ID)) {
      addButton()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
