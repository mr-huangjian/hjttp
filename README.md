
# hjttp

## Install


```shell
yarn add hjttp
```

or

```shell
npm install hjttp
```


## Introduce

1. based on **fetch**
2. you can set duration and message when network timeout.
3. you can judge whether the response is successful or not.
3. you can listen request and response by call `apiRequestCallback`、`apiResponseSuccess`、`apiResponseFailure`
4. you can intercept and change response by call `apiResponseIntercept`

Common Configuration:

|  Prop  |  Type  |  Default Value  |  Description  |
|  ----  | ----  | ----  | ----  |
| method  | String | `POST` |  |
| cache  | String | `no-cache` |  |
| headers  | Object | ```{'Accept': 'application/json','Content-Type': 'application/json;charset=utf-8','Cache-Control': 'no-cache',}``` |  |
| parse  | Function | `_ => _.json()` | parse response data |
| timeoutDuration  | Number | `1000 * 10` |  |
| timeoutMessage  | String | `Network Timeout` |  |
| apiRequestCallback  | Function | `_ => _` | params is `request` |
| apiResponseSuccess  | Function | `_ => _` | params is `{ request, response }` |
| apiResponseFailure  | Function | `_ => _` | params is `{ request, error }` |
| apiResponseIntercept  | Function | `(req, resp, opt) => resp` |  |

## Usage

```js
import Http from 'hjttp'
```

```js
Http.timeoutDuration = 1000 * 60
Http.timeoutMessage = 'Network is timeout, Please try again.'
```

```js
Http.load({
    url: 'http://api.website.com/login.do',
    body: {
        'key': value
    }
}, {
    reformer: (response) => {
        let result = JSON.parse(JSON.stringify(response))
        result.code = Number(result.code)
        result.message = result.msg
        result.ok = result.code == 0
        return result
    },
})
```

```js
Http.apiRequestCallback = (request) => {
    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(51)}Request Start${' '.repeat(50)}*\n${'*'.repeat(115)}\n`)
    console.log('HTTP URL:\n\t' + request.url)
    console.log('\nHTTP Method:\n\t' + request.method)
    console.log('\nHTTP Headers:\n\t' + JSON.stringify(request.headers, null, 0))
    console.log('\nHTTP Body:\n\t' + request._bodyText)
    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(51)}Request End${' '.repeat(52)}*\n${'*'.repeat(115)}\n`)
}
```

```js
Http.apiResponseSuccess = ({ request, response }) => {
    let body = ""
    try {
        body = JSON.parse(request._bodyText)
    } catch (e) {}

    const req = {
        url: request.url,
        body,
    }

    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(50)}Response Start${' '.repeat(50)}*\n${'*'.repeat(115)}\n`)
    console.log('Request:\n' + JSON.stringify(req, null, 4))
    console.log('\nResponse Status:\n\t' + response.status)
    console.log('\nResponse Body:\n' + JSON.stringify(JSON.parse(response._bodyText), null, 4))
    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(50)}Response End${' '.repeat(52)}*\n${'*'.repeat(115)}\n`)
}
```

```js
Http.apiResponseFailure = ({ request, error }) => {
    const req = {
        url: request.url,
        body: JSON.parse(request._bodyText),
    }

    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(50)}Response Start${' '.repeat(50)}*\n${'*'.repeat(115)}\n`)
    console.log('Request:\n\t' + JSON.stringify(req, null, 4))
    console.log('\nResponse Body:\n\t' + error.status + ', ' + error.message)
    console.log(`\n${'*'.repeat(115)}\n*${' '.repeat(50)}Response End${' '.repeat(52)}*\n${'*'.repeat(115)}\n`)
}
```

```js
Http.apiResponseIntercept = (request, response, option) => {
    return new Promise((resolve, reject) => {
        const { url } = request
        const { code } = response

        if (url.includes('/login.do')) {
            if (code >= 1000000) {
                reject()

                /**
                    handle ...
                 */
            } else {
                resolve(response)
            }
        } else {
            resolve(response)
        }
    })
}
```

## Contact me

- `github.com/mr-huangjian`
- `mr.huangjian@foxmail.com`

---

