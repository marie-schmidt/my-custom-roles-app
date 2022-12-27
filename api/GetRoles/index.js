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
            'Authorization': `Bearer "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjRyQ045anhiM05GVENfWEkzRk82dWUxeHhvOS1BMU1xYXBjR2w0R0RZeXciLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yYjVmMTZjMi00ODUyLTRhYzAtYmY4ZS1lYzQzODA2NjViZTYvIiwiaWF0IjoxNjcyMTU4NDMxLCJuYmYiOjE2NzIxNTg0MzEsImV4cCI6MTY3MjE2MjMzMSwiYWlvIjoiRTJaZ1lOaHFYRHhsdDNQeC9uV1B2NWFWYkR4ZkRRQT0iLCJhcHBfZGlzcGxheW5hbWUiOiJNeVN0YXRpY1dlYkFwcCIsImFwcGlkIjoiYTBjNzQzMjUtNTk0Yy00OTZhLWFhMmMtYzg5MWQyYzEyYjVhIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMmI1ZjE2YzItNDg1Mi00YWMwLWJmOGUtZWM0MzgwNjY1YmU2LyIsImlkdHlwIjoiYXBwIiwib2lkIjoiNDFmMjM1MDMtNzllMi00ZDE4LTliOTItZWIxZjY0MTJjNmI4IiwicmgiOiIwLkFYMEF3aFpmSzFKSXdFcV9qdXhEZ0daYjVnTUFBQUFBQUFBQXdBQUFBQUFBQUFDY0FBQS4iLCJzdWIiOiI0MWYyMzUwMy03OWUyLTRkMTgtOWI5Mi1lYjFmNjQxMmM2YjgiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiIyYjVmMTZjMi00ODUyLTRhYzAtYmY4ZS1lYzQzODA2NjViZTYiLCJ1dGkiOiJDWExEYzVVeDUwLTVuRVJnX0RGVUFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyIwOTk3YTFkMC0wZDFkLTRhY2ItYjQwOC1kNWNhNzMxMjFlOTAiXSwieG1zX3RjZHQiOjE2NjA2MTE4NTF9.ZlSNQMDoNiuZoU4dlaPgdNEKXiTAEwK9wRE-UgtfNU_6mMquX45UMRUoBy7Wr1hd4zSHtV2QSrdJ8vQ_X-M5kb79qbOfKUQair0sj2lHDQ85hyUS1D2mNfnKlM9tjB8bzQsMTyP9HfFB7uouny5SOgyGlWdirUQAG4YbXGVOPu8TL9CQighMm1XyarY6EEsxbqHQ_NMTTlno_K9pUB3RXYp_GeUAyJ-mmBICaC_iWo4xhLOA7Bq9wHv3ZT97AU2zEtk8k9mpWUr38TXEcQma9zGxfg9-HpV7Btf5bZ2gjU82Cw19zK1phVZ4jsi1etx2W92awp7re4lhDAqw4xe5ww"`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}
