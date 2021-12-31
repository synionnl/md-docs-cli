exports.getInfo = function () {
    const branch = await __exec(`git rev-parse --abbrev-ref HEAD`);    
    const repository = await parseGitRepository();
    const remote = await parseRemoteOrigin();

    const path = branch != remote.mainBranch ? "/" + featureBranchToPath(branch) : "";

    const localBranches = (await __exec(`git branch -a`))
        .split(`\n`)
        .map(b => b.replace("*", "").trim())
        .filter(b => !b.startsWith("remotes"));

    const branches = remote.branches.concat(localBranches.filter(b => !remote.branches.includes(b)))
        .map(b => ({
            name: b,
            path: b == remote.mainBranch ? "" : featureBranchToPath(b),
            isFeatureBranch: b != remote.mainBranch
        }))
        .sort((a, b) => `${a.isFeatureBranch ? "z" : "a"}${a.name}`.localeCompare(`${b.isFeatureBranch ? "z" : "a"}${b.name}`));

    return { 
        branch,
        isFeatureBranch: branch != remote.mainBranch, 
        repository,
        path,
        branches
    };
}

async function __exec(command) {
    const { stdout, stderr } = await exec(command, { timeout: 5000 });
    
    if(stderr.trim() != "")
        throw stderr.trim();

    return stdout.trim();
}

async function parseGitRepository() {
    const originUrl = await __exec(`git config --get remote.origin.url`);
    const parts = originUrl.trim().split("/");
    let repository = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    if(repository.endsWith(".git"))
        repository = repository.substring(0, repository.length - 4);

    const index = repository.indexOf(":");
    if(index > -1)
        repository = repository.substring(index + 1);

    return repository;
}

async function parseRemoteOrigin() {
    const name = await __exec(`git remote`);
    const lines = parseGitReponse((await __exec(`git remote show ${name}`)));

    const response = {
        mainBranch: lines
            .filter(l => l.key == "HEAD branch")
            .map(l => l.value)
            [0],
        branches: lines
            .filter(l => l.key.startsWith("Remote branch"))
            .map(l => l.value.map(l => l.substr(0, l.indexOf(" "))))
            [0]
    };
    
    return response;
}

function parseGitReponse(response) {
    const lines = response.split(`\n`);
    const parsed = [];

    lines.forEach(line => {
        const index = line.indexOf(":");        
        if (index == -1) {
            if (parsed.length === 0)
                return;
            
            const last = parsed[parsed.length - 1];
            if (last.value == "") {
                last.value = [];
            }
            
            last.value.push(line.trim());
            return;
        }

        const key = line.substr(0, index).trim();
        const value = line.substr(index + 1).trim();

        parsed.push({ key, value });        
    });

    return parsed;

}

function featureBranchToPath(branch) {
    return branch
        .replace(" ", "-")
        .toLowerCase();
}