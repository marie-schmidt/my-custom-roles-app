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
            'Authorization': `Bearer "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuYXp1cmUuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMmI1ZjE2YzItNDg1Mi00YWMwLWJmOGUtZWM0MzgwNjY1YmU2LyIsImlhdCI6MTY3MjE1NjA0MiwibmJmIjoxNjcyMTU2MDQyLCJleHAiOjE2NzIxNTk5NDIsImFpbyI6IkUyWmdZSml6dGpMZHU5T2JTMmtTaTUvRWlieGNBQT09IiwiYXBwaWQiOiJhMGM3NDMyNS01OTRjLTQ5NmEtYWEyYy1jODkxZDJjMTJiNWEiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yYjVmMTZjMi00ODUyLTRhYzAtYmY4ZS1lYzQzODA2NjViZTYvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiI0MWYyMzUwMy03OWUyLTRkMTgtOWI5Mi1lYjFmNjQxMmM2YjgiLCJyaCI6IjAuQVgwQXdoWmZLMUpJd0VxX2p1eERnR1piNWtaSWYza0F1dGRQdWtQYXdmajJNQk9jQUFBLiIsInN1YiI6IjQxZjIzNTAzLTc5ZTItNGQxOC05YjkyLWViMWY2NDEyYzZiOCIsInRpZCI6IjJiNWYxNmMyLTQ4NTItNGFjMC1iZjhlLWVjNDM4MDY2NWJlNiIsInV0aSI6InMtSG00cndhdzBLZ1F5c1NOMWcxQWciLCJ2ZXIiOiIxLjAiLCJ4bXNfdGNkdCI6MTY2MDYxMTg1MX0.OUh27xQyQLOEL0NvsPc8-Dwk0QljOwJuJ1-ZGwcgenVBkRD_HBHDMHzkn8JTL-6c3_lx3OAq0T9UhhSrtlcnaYn2ulh3XesEV30qvaq0JTvJ_PC9Br_yQ-1OBfHh-zgJ_FZMztNChyyAXr_KO-ILsthKZA4plkIjwZiZzkOCyhwCGZqXk36Y_sX0Ihrbpki5Ij7kWZS4PVPT0_tVbJ2xzxKGCUnFy_-HpYm_S4sWH1VRy5IF8tS_OqQG_95DoMro3m9Y6RN2Q6rfwqiAdE9D3P4lTcQJNMbHixP00mgKj-nfEAGD-YdQXCFLxTLE89DlJ1l7x35sue-9_55wX1ZiOA"`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}
