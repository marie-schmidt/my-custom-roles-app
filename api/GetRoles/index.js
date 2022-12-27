const fetch = require('node-fetch').default;

// add role names to this object to map them to group ids in your AAD tenant
const roleGroupMappings = {
    'admin': '31e97fac-0fed-4d77-a6c1-74194658ac94',
    'reader': 'bea58852-6f51-4944-a551-806db93fb0d3'
};

module.exports = async function (context, req) {
    const user = req.body || {};
    const roles = [];
    
    for (const [role, groupId] of Object.entries(roleGroupMappings)) {
        if (await isUserInGroup(groupId, user.accessToken)) {
            roles.push(role);
        }
    }

    context.res.json({
        roles
    });
}

async function isUserInGroup(groupId, bearerToken) {
    const url = new URL('https://graph.microsoft.com/v1.0/me/memberOf');
    url.searchParams.append('$filter', `id eq '${groupId}'`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuYXp1cmUuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMmI1ZjE2YzItNDg1Mi00YWMwLWJmOGUtZWM0MzgwNjY1YmU2LyIsImlhdCI6MTY3MjE1NzU4MywibmJmIjoxNjcyMTU3NTgzLCJleHAiOjE2NzIxNjE0ODMsImFpbyI6IkUyWmdZTGhSNnZhNzlmeER2dW5UWjdGOWJ2NVRDUUE9IiwiYXBwaWQiOiJhMGM3NDMyNS01OTRjLTQ5NmEtYWEyYy1jODkxZDJjMTJiNWEiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yYjVmMTZjMi00ODUyLTRhYzAtYmY4ZS1lYzQzODA2NjViZTYvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiI0MWYyMzUwMy03OWUyLTRkMTgtOWI5Mi1lYjFmNjQxMmM2YjgiLCJyaCI6IjAuQVgwQXdoWmZLMUpJd0VxX2p1eERnR1piNWtaSWYza0F1dGRQdWtQYXdmajJNQk9jQUFBLiIsInN1YiI6IjQxZjIzNTAzLTc5ZTItNGQxOC05YjkyLWViMWY2NDEyYzZiOCIsInRpZCI6IjJiNWYxNmMyLTQ4NTItNGFjMC1iZjhlLWVjNDM4MDY2NWJlNiIsInV0aSI6Imo1bjJIelBhMkVPNmNlM2pLdGpfQVEiLCJ2ZXIiOiIxLjAiLCJ4bXNfdGNkdCI6MTY2MDYxMTg1MX0.g1TZPeCd87ETskOtt6qyiUomM7lZ70Twq8o2DHvs7yAt12NtJmTkN2gdVLat7ZdTMco_Gg99JiWAPGGK2r0ag50ss-c6Dt8-2q_i1aIiqOxsmKsdYCCN4md--b3vx8p8N19G70XBbohmz6RuEBYC8XYPksBI40Nnz4Rcw28ckWQwJxyVq-NMy1pLRm5Z3dPVEEHr6RdOn6Mbr24fXzlP4QxT7lROkYvJkB_RQ7igHpfD4KjHh24epiV2JF75-qLhe-2EVeyTBfkuSZxOamPZDsFC71WyGDUVlp3HSFjrZIh5WgWbFYRsZof87I49AmhBb36BW3WTt6u9hkNEH6tC6w"`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}
