const input = document.getElementById("repo-input");
const autocompleteList = document.getElementById("autocomplete-list");
const repoList = document.getElementById("repo-list");
let repos = [];

// Функция debounce для предотвращения избыточных запросов
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Функция для получения репозиториев с GitHub
async function fetchRepos(query) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`
  );
  const data = await response.json();
  return data.items.slice(0, 5) || []; // Возвращаем первые 5 репозиториев
}

// Отображение списка автокомплита
function showAutocomplete(repos) {
  autocompleteList.innerHTML = "";
  if (repos.length === 0) {
    autocompleteList.style.display = "none";
    return;
  }
  repos.forEach((repo) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = repo.name;
    div.onclick = () => addRepo(repo);
    autocompleteList.appendChild(div);
  });
  autocompleteList.style.display = "block";
}

// Добавление репозитория в список
function addRepo(repo) {
  const existingRepo = repos.find((r) => r.id === repo.id);
  if (!existingRepo) {
    repos.push(repo);
    renderRepoList();
    input.value = ""; // Очищаем поле ввода
    autocompleteList.style.display = "none"; // Скрываем список автодополнений
  }
}

// Рендер списка добавленных репозиториев
function renderRepoList() {
  repoList.innerHTML = "";
  repos.forEach((repo) => {
    const div = document.createElement("div");
    div.className = "repo-item";
    div.innerHTML = `
            <a href="${repo.html_url}" target="_blank">${repo.name}</a> - ${repo.owner.login} - ⭐ ${repo.stargazers_count}
            <button onclick="removeRepo(${repo.id})">Удалить</button>
        `;
    repoList.appendChild(div);
  });
}

// Удаление репозитория из списка
function removeRepo(repoId) {
  repos = repos.filter((repo) => repo.id !== repoId);
  renderRepoList();
}

// Обработка ввода в поле (debounced)
input.addEventListener(
  "input",
  debounce(async () => {
    const query = input.value.trim();
    if (query === "") {
      autocompleteList.style.display = "none";
      return;
    }
    const repos = await fetchRepos(query);
    showAutocomplete(repos);
  }, 300)
);
