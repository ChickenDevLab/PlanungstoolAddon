function loadConferences(id) {
    return new Promise((resolve, reject) => {
        fetch('https://www.planungstool-fsg.de?id=' + id).then(r => r.text()).then(t => {
            const dom = $(t)

            let days = []
            $('div.form', dom).each((index1, element1) => {
                const $element1 = $(element1)
                let dateLine = $('h2', $element1).text()
                days[index1] = {
                    date: dateLine.substr(dateLine.length - 10),
                    conferences: []
                }

                $('div.itemkonferenz', $element1).each((index2, element2) => {
                    const $element2 = $(element2)
                    let conference = {}
                    conference.id = new Date($('span#timestamp', $element2).text()).valueOf()
                    conference.type = $('font.label_blue', $element2).text()
                    conference.fach = $('#fach', $element2).text()
                    conference.zeit = $('#zeit', $element2).text()

                    const hinweis = $('#hinweis', $element2)
                    if (hinweis.children().length == 1) {
                        if (hinweis.contents().first().prop('tagName') === 'A') {
                            if (hinweis.contents().first().attr('href').includes('bbb.schullogin.de')) {
                                conference.href = hinweis.contents().first().attr('href')
                                conference.location = 'Auf Schullogin.de'
                            } else {
                                conference.href = hinweis.contents().first().attr('href')
                                conference.location = 'Externe Plattform'
                            }
                        }

                        hinweis.contents().each((index, e) => {
                            $e = $(e)
                            if($e.prop('tagName') === 'A'){
                                const data = $e.attr('href')
                                if(data.includes('bbb.schullogin.de')){
                                    conference.href = data
                                    conference.location = 'Auf Schullogin.de'
                                }
                            }
                        })
                    } else if (hinweis.text().toLowerCase() === 'lernsax') {
                        conference.location = 'Auf Lernsax'
                    } else {
                        conference.notice = hinweis.text()
                    }

                    days[index1].conferences.push(conference)


                })
            })
            resolve(days)
        }).catch(err => {
            reject(err)
        })
    })
}

function validateId(input) {
    return new Promise((resolve, reject) => {
        let out
        if(input.length == 4){
            out = input
        } else if (input.includes('planungstool-fsg.de')){
            try{
                const url = new URL(input)
                const arr = url.pathname.split('/')
                if(arr[arr.length - 1] === ''){
                    arr.pop()
                }

                if(arr[arr.length - 1].length == 4){
                    out = arr[arr.length -1]
                }else{
                    resolve(false)
                    return
                }
            } catch (e) {
                resolve(false)
                return
            }
        } else {
            resolve(false)
            return
        }
        fetch('https://www.planungstool-fsg.de?id=' + out).then(r => r.text()).then(t => {
            resolve((t.includes('nomatch') ? false : out))
        }).catch(err => {
            resolve(false)
        })
    })
}

function validateTeacherId(input) {
    return new Promise((resolve, reject) => {
        fetch('https://planungstool-fsg.de/klassen_id.php?lehrer_id=' + input).then(r => r.text()).then(t => {
            resolve((t.includes('nomatch') ? false : input))
        }).catch(err => {
            resolve(false)
        })
    })
}

function getAccounts(){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['accounts'], (data) => {
            if(data.accounts){
                resolve(data.accounts)
            } else {
                resolve([])
            }
        })
    })
}

function getIgnoredLSAccounts(){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['ignoredAccounts'], (data) => {
            if(data.ignoredAccounts){
                resolve(data.ignoredAccounts)
            } else {
                resolve([])
            }
        })
    })
}

function saveIgnoredLSAccounts(accounts){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            ignoredAccounts: accounts
        }, (data) => {
            resolve(true)
        })
    })
}

function saveAccounts(accounts){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({
            accounts: accounts
        }, (data) => {
            resolve(true)
        })
    })
}

function loadClassesByTeacherId(id) {
    return new Promise((resolve, reject) => {
        fetch('https://planungstool-fsg.de/klassen_id.php?lehrer_id=' + id).then(r => r.text()).then(t => {
            const dom = $('<html><body>' +t + '</body></html>')
            let ret = []
            $('span', dom).each((index, element) => {
                ret.push({
                    id: $(element).attr('data-id'),
                    name: $(element).text()
                })
            })

            resolve(ret)
        }).catch(err => {
            reject(err)
        })
    })
}