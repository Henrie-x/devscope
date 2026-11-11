    const searchForm = document.getElementById("searchForm");
    const usernameInput = document.getElementById("usernameInput");
    const searchButton = document.getElementById("searchButton");
    
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");
    const loadingText = document.getElementById("loadingText");
    
    const errorState = document.getElementById("errorState");
    const errorTitle = document.getElementById("errorTitle");
    const errorMessage = document.getElementById("errorMessage");
    
    const profileSection = document.getElementById("profileSection");
    const saveDeveloperBtn = document.getElementById("saveDeveloperBtn");
    
    const savedSection = document.getElementById("savedSection");
    const savedList = document.getElementById("savedList");
    const savedCount = document.getElementById("savedCount");
    const savedEmpty = document.getElementById("savedEmpty");
    
    const reposSection = document.getElementById("reposSection");
    const repoList = document.getElementById("repoList");
    const repoEmpty = document.getElementById("repoEmpty");
    
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileUsername = document.getElementById("profileUsername");
    const profileBio = document.getElementById("profileBio");
    
    const profileLocation = document.getElementById("profileLocation");
    const profileCompany = document.getElementById("profileCompany");
    
    const repoCount = document.getElementById("repoCount");
    const followerCount = document.getElementById("followerCount");
    const followingCount = document.getElementById("followingCount");
    
    const profileLink = document.getElementById("profileLink");
    
    let currentDeveloper = null;
    let currentRepositories = [];
    let storageKey = "devfinder-saved"
    let devData = []
    
    function saveDevData() {
        localStorage.setItem(storageKey,JSON.stringify(devData))
    }
    
    searchForm.addEventListener("submit",async (e) => {
        e.preventDefault()
        
        const username = usernameInput.value.trim()
        
        if(!username) return;
        
        emptyState.hidden = true;
        errorState.hidden = true;
        profileSection.hidden = true;
        reposSection.hidden = true;
        
        loadingState.hidden = false;
        loadingText.textContent = `Searching for @${username}...`;
        
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";
        
        try {
            
            currentDeveloper = await getGithubUser(username)
            currentRepositories = await getGithubrepos(username)
            
            renderProfile()
            renderRepositories()
            
            reposSection.hidden = false;
            usernameInput.value = ""
            
        } catch (error) {
            errorTitle.textContent = "User not found";
            errorMessage.textContent = `We couldn't find a GitHub user with the username "@${username}". Check the spelling and try again.`;
            
            errorState.hidden = false;
            currentDeveloper = null;
            currentRepositories = [];
        }finally {
            loadingState.hidden = true;
            searchButton.disabled = false;
            searchButton.textContent = "Search";
        }
    })

    
    
    async function getGithubUser(username) {
        const res = await fetch(`https://api.github.com/users/${username}`)
        
        if(!res.ok) {
            throw new Error("User not found");
        }
        
        const data = await res.json()
        
        return data
    }
    
    async function getGithubrepos(username) {
        const res = await fetch(`https://api.github.com/users/${username}/repos`)
        
        if(!res.ok) {
            throw new Error("user repo not found")
        }
        
        const data = await res.json()
        
        return data
    }
    
    function renderProfile() {
        if(!currentDeveloper) return;
        
        emptyState.hidden = true
        
        const dev = currentDeveloper;
        
        profileAvatar.src = dev.avatar_url;
        profileName.textContent = dev.name || dev.login;
        profileUsername.textContent = `@${dev.login}`;
        profileBio.textContent = dev.bio || "No biography available.";
        profileLocation.textContent = dev.location || "Not specified";
        profileCompany.textContent = dev.company || "Not specified";
        repoCount.textContent = dev.public_repos;
        followerCount.textContent = dev.followers;
        followingCount.textContent = dev.following;
        profileLink.href = dev.html_url;
        profileSection.hidden = false;
    }
    
    function renderRepositories() {
        repoEmpty.hidden = currentRepositories.length !== 0;
        
        repoList.innerHTML = ""
        const latest = [...currentRepositories].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,6)
        
        const fragment= document.createDocumentFragment()
        
        latest.forEach(repo => {
            const li = document.createElement("li");
            li.className = "repo-card";
            li.dataset.id = repo.id;
            
            const top = document.createElement("div");
            top.className = "repo-card-top";
            
            const name = document.createElement("h3");
            name.className = "repo-name";
            name.textContent = repo.name;
            
            const visibility = document.createElement("span");
            visibility.className = "repo-visibility";
            visibility.textContent = repo.private ? "Private" : "Public";
            top.append(name, visibility);
            
            const desc = document.createElement("p");
            desc.className = "repo-description";
            desc.textContent = repo.description ?? "No description yet — the owner hasn't added one for this project";
            
            const bottom = document.createElement("div");
            bottom.className = "repo-card-bottom";
            
            const langWrap = document.createElement("div");
            langWrap.className = "repo-language";
            
            const dot = document.createElement("span");
            dot.className = "repo-language-dot";
            const langName = document.createElement("span");
            langName.className = "repo-language-name";
            langName.textContent = repo.language ?? "unknown";
            langWrap.append(dot, langName);
            
            const stats = document.createElement("div");
            stats.className = "repo-stats";
            
            const starStat = document.createElement("span");
            starStat.className = "repo-stat";
            const starIcon = document.createElement("i");
            starIcon.className = "icon-star";
            const starCount = document.createElement("span");
            starCount.className = "repo-stars-count";
            starCount.textContent = repo.stargazers_count;
            starStat.append(starIcon, starCount);
            
            const forkStat = document.createElement("span");
            forkStat.className = "repo-stat";
            const forkIcon = document.createElement("i");
            forkIcon.className = "icon-git-fork";
            const forkCount = document.createElement("span");
            forkCount.className = "repo-forks-count";
            forkCount.textContent = repo.forks_count;
            forkStat.append(forkIcon, forkCount);
            
            stats.append(starStat, forkStat);
            bottom.append(langWrap, stats);
            
            li.append(top, desc, bottom);
            fragment.append(li);
        })
        
        repoList.append(fragment);
    }
    
    function handleSave() {
        if(!currentDeveloper) return;
        
        const alreadySaved = devData.some(dev => dev.login === currentDeveloper.login)
        
        if(alreadySaved) {
            alert(`@${currentDeveloper.login} is already saved.`);
            return;
        }
        
        devData.push(currentDeveloper)
        saveDevData()
        renderSavedDevelopers()
    }
    
    function loadSavedDevelopers() {
        try {
            const raw = localStorage.getItem(storageKey)
            const parsed = raw ? JSON.parse(raw) : []
            
            devData = Array.isArray(parsed) ? parsed : []
        } catch (e) {
            devData = []
        }
        
        renderSavedDevelopers()
    }
    
    function renderSavedDevelopers() {
        savedCount.textContent = devData.length;
        savedEmpty.hidden = devData.length !== 0;
        savedSection.hidden = false;
        savedList.innerHTML = ""
        
        let fragment = document.createDocumentFragment()
        
        devData.forEach(dev => {
            const li = document.createElement("li");
            li.className = "saved-card";
            li.dataset.id = dev.id;
            
            const avatarWrap = document.createElement("div");
            avatarWrap.className = "saved-avatar-wrap";
            const img = document.createElement("img");
            img.src = dev.avatar_url; 
            img.alt = dev.login;
            avatarWrap.append(img);
            
            const info = document.createElement("div");
            info.className = "saved-info";
            const nameEl = document.createElement("strong");
            nameEl.className = "saved-name";
            nameEl.textContent = dev.name || dev.login;
            const usernameEl = document.createElement("span");
            usernameEl.className = "saved-username";
            usernameEl.textContent = `@${dev.login}`;
            info.append(nameEl, usernameEl);
            
            const actions = document.createElement("div");
            actions.className = "saved-actions";
            const viewBtn = document.createElement("button");
            viewBtn.type = "button";
            viewBtn.className = "saved-link";
            viewBtn.textContent = "View";
            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "delete-link";
            removeBtn.textContent = "Remove";
            actions.append(viewBtn, removeBtn);
            
            li.append(avatarWrap, info, actions);
            fragment.append(li);
        });
          
        savedList.append(fragment);
    }
    
    savedList.addEventListener("click",async (e) => {
        const btn = e.target.closest("button")
        if(!btn) return;
        
        const isDelete = btn.classList.contains("delete-link");
        const isView = btn.classList.contains("saved-link");
        if (!isDelete && !isView) return;
        
        const li = btn.closest("li")
        if(!li) return
        
        const id = Number(li.dataset.id)
        
        if(isDelete) {
            devData = devData.filter(dev => dev.id !== id)
            saveDevData()
            renderSavedDevelopers()
            return
        }
        
        if(isView) {
            const dev = devData.find(dev => dev.id === id)
            if(!dev) return;
            
            currentDeveloper = dev
            
            emptyState.hidden = true;
            errorState.hidden = true;
            
            try {
                currentRepositories = await getGithubrepos(dev.login)
                
                renderProfile()
                renderRepositories()
                
                reposSection.hidden = false;
                
                profileSection.scrollIntoView({
                    behavior: "smooth"
                })
            } catch (e) {
                currentRepositories = []
                repoList.innerHTML = ""
                reposSection.hidden = true;
                
                profileSection.scrollIntoView({
                    behavior: "smooth"
                })
                
                renderProfile();
                errorTitle.textContent = "Could not load repositories";
                errorMessage.textContent = `Could not load repositories for @${dev.login}.`;
                errorState.hidden = false;
            }
        }
    })
    
    saveDeveloperBtn.addEventListener("click",handleSave)
    loadSavedDevelopers()