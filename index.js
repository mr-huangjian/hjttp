
import QueryStringify from 'querystringify'

export default Http = {
    method: 'POST',
    cache: 'no-cache',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': 'no-cache',
    },
    parse: _ => _.json(),
    timeoutDuration: 1000 * 10,
    timeoutMessage: 'Network Timeout',
    apiRequestCallback: _ => _,
    apiResponseSuccess: _ => _,
    apiResponseFailure: _ => _,
    apiResponseIntercept: (req, resp, opt) => resp,
}

Http.load = function(request, option = {}) {
    return new Promise(function(resolve, reject) {
        load(request)
        .then(response => Http.apiResponseIntercept(request, response, option))
        .then(response => {
            if (option.reformer) {
                const data = option.reformer(response)
                if (data.ok) {
                    resolve(data)
                } else {
                    reject(data)
                }
            } else {
                resolve(response)
            }
        })
        .catch(error => error && reject(error))
    })
}

function load({
    method = Http.method,
    url,
    body,
    cache = Http.cache,
    headers = Http.headers,
    timeout = Http.timeoutDuration,
    parse = Http.parse
}) {
    var dispatchTimeout = null
    var overtimePromise = new Promise((resolve, reject) => {
        dispatchTimeout = () => {
            const error = new TypeError(Http.timeoutMessage)
            error.timeout = true
            reject(error)
        }
    })
    setTimeout(() => {
        dispatchTimeout()
    }, timeout)

    /* start load */
    if (headers) {
        if (headers['Content-Type']) {
            const value = headers['Content-Type'].split(';')

            if (value.includes('application/x-www-form-urlencoded')) {
                body = QueryStringify.stringify(body)
            }

            if (value.includes('application/json')) {
                body = JSON.stringify(body)
            }
        }
    }

    if (method == 'GET' && body) {
        url = url + '?' + body
        body = null
    }

    let request = new Request(url, {method, body, cache, headers})
    Http.apiRequestCallback(request)

    let data = {
        request
    }

    var connectPromise = new Promise(function(resolve, reject) {
        fetch(request).then(function(response) {
            if (response.ok) {
                data.response = response
                return parse(response)
            } else {
                reject(response)
            }
        }).then(function(response) {
            resolve(response)

            data.response._bodyText = JSON.stringify(response)
            Http.apiResponseSuccess(data)
        }).catch(function(error) {
            if (error) {
                if (error.constructor.name == 'TypeError' && error.message == 'Network request failed') {
                    error.message = Http.timeoutMessage
                    error.timeout = true
                }
            }

            reject(error)
        })
    })
    /* end load */

    return new Promise((resolve, reject) => {
        Promise.race([connectPromise, overtimePromise]).then((response) => {
            resolve(response)
        }).catch((error) => {
            reject(error)

            data.error = error
            Http.apiResponseFailure(data)
        })
    })
}
