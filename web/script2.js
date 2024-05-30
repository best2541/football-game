let type = 1
let scoreA = 1
let scoreB = 3
let rank = 999
let score = 0
let totalScore = 0
let ind = 0
let ind2 = 0
const pattern = [[window.innerWidth / 1.2, window.innerHeight / 2, -1, 1], [window.innerWidth / 1.2, window.innerHeight / 2, -1, 1], [window.innerWidth / 4, window.innerHeight / 2, 1, -1], [window.innerWidth / 3, window.innerHeight / 1.5, 1, -0.7], [window.innerWidth / 2, window.innerHeight / 2, -1, 1], [window.innerWidth / 2, window.innerHeight / 2, 2, -1], [window.innerWidth / 2, window.innerHeight / 2, -2, 1], [window.innerWidth / 2, window.innerHeight / 3, -1, 1], [window.innerWidth / 3, window.innerHeight / 3, 1, 1], [window.innerWidth / 2, window.innerHeight / 3, 1.1, 1.2], [window.innerWidth / 2, window.innerHeight / 1.5, 0, -1.8], [window.innerWidth / 2, window.innerHeight / 2, 0, 0], [window.innerWidth / 1.2, window.innerHeight / 1.5, -2, -1.5], [window.innerWidth / 2, window.innerHeight / 2, 1, -1.5], [window.innerWidth / 4, window.innerHeight / 2, 2, -1], [window.innerWidth / 1.2, window.innerHeight / 3, -1, 1], [window.innerWidth / 3, window.innerHeight / 3, 1, 1]]
let footballX = window.innerWidth / 2; // Initial X position
let footballY = window.innerHeight / 2; // Start at the bottom of the screen
let footballX_2 = window.innerWidth / 2; // Initial X position
let footballY_2 = window.innerHeight / 2; // Start at the bottom of the screen
let random = 0
let random_2 = 0
let bonusCount = 1
let moveUpTime = 7; // Duration of moving upwards (1 second)
let timeCounter = 0
let timeCounter_2 = 0
let cooldown = 0
let cooldown_2 = 0
let check = false
let check_2 = false
let bonusCheck = false
let defaultHardLevel = 1
let hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
let isOver = true
const api = 'https://central-game.ants.co.th'
let timeLimitLevel = 4
let token

//Line Auth
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state')
if (!(window.location.href).startsWith("file://") && !(window.location.href).startsWith("http://localhost")) {

  if (code && state) {
    axios.post('https://api.line.me/oauth2/v2.1/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://central-game.ants.co.th',
      client_id: '2004588192',
      client_secret: '792518900ce4dca2b5b90f0768840180'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(result => {
      if (result?.data?.id_token) {
        token = result.data.id_token
        axios.post(`${api}/game/getuser`, {
          token: token
        }).then(result => {
          if (result.data) {
            rank = result.data?.rank || 999
            window.localStorage.setItem('uid', result.data.sub)
            window.localStorage.setItem('name', result.data.name)
            window.localStorage.setItem('image', result.data.picture)
            if (result.data.phone) {
              window.localStorage.setItem('phone', result.data.phone)
            } else {
              window.localStorage.removeItem('phone')
            }
            if (result.data.score) {
              totalScore = result.data.score
            }
          }
        })
      }
    })
      .catch(err => {
        window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2004588192&redirect_uri=https://central-game.ants.co.th&state=${new Date().getTime()}&scope=profile%20openid`
      })
  } else {
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2004588192&redirect_uri=https://central-game.ants.co.th&state=${new Date().getTime()}&scope=profile%20openid`
  }
}

function checkStart() {
  if (window.localStorage.getItem('type') && new Date(window.localStorage.getItem('type')) > new Date()) {
    document.getElementById('info').src = './img/info2.png'
    document.getElementById('gotone').src = './img/gotone2.png'
    document.getElementById('gottwo').src = './img/gottwo2.png'
    document.getElementById('info-one').innerHTML = 'ลูกฟุตบอล 1 ลูก ได้ 2 แต้ม'
    document.getElementById('info-two').innerHTML = 'ฟุตบอลที่มีโลโก้ 3 แบบ 1 ลูก ได้ 6 แต้ม'
    scoreA = 2
    scoreB = 6
  } else {
    document.getElementById('info').src = './img/info.png'
    document.getElementById('gotone').src = './img/gotone.png'
    document.getElementById('gottwo').src = './img/gottwo.png'
    document.getElementById('info-one').innerHTML = 'ลูกฟุตบอล 1 ลูก ได้ 1 แต้ม'
    document.getElementById('info-two').innerHTML = 'ฟุตบอลที่มีโลโก้ 3 แบบ 1 ลูก ได้ 3 แต้ม'
    scoreA = 1
    scoreB = 3
  }
}

//getstart
function getStart() {
  checkStart()
  axios.post(`${api}/game/getstart`)
    .then(result => {
      if (result.data.server_status.server_status != 1)
        throw new Error('server is offline')
      if (result?.data?.user.length > 0) {
        window.localStorage.setItem('uid', result.data.user[0].uid)
        window.localStorage.setItem('name', result.data.user[0].name)
        window.localStorage.setItem('image', result.data.user[0].picture)
        if (result.data.user[0].phone)
          window.localStorage.setItem('phone', result.data.user[0].phone)
      }
      if (result?.data?.setting) {
        defaultHardLevel = result.data.setting.level
        timeLimitLevel = result.data.setting.time_limit_level
        window.localStorage.setItem('type', result.data.setting.type)
        hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
        getRandomNumber()
        getRandomNumber_2()
      }
    }).catch(() => {
      const start = document.getElementById('start-containner')
      const maintain = document.getElementById('maintain-containner')
      maintain.style.display = 'block'
      start.style.display = 'none'
    })
}

function gameOver() {
  const cheer_audio = new Audio("cheer.mp3");
  cheer_audio.play();
  isOver = true
  document.getElementById('profile').src = window.localStorage.getItem('image')
  const phone = window.localStorage.getItem('phone')
  document.getElementById('countdown-number').innerHTML = 3
  document.getElementById('countdown-section').style.display = 'block'
  document.getElementById('containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'block'
  if (phone) {
    document.getElementById('result-form').style.display = 'none'
  } else {
    document.getElementById('result-form-phone').style.display = 'none'
  }
  check = true
  axios.post(`${api}/game/save`, { uid: localStorage.getItem('uid'), name: localStorage.getItem('name'), score: phone?.toString()?.length > 0 ? score.toString() : '-999' })
    .then(() => {
      axios.post(`${api}/game/getranking?uid=${window.localStorage.getItem('uid')}`)
        .then(async result => {
          if (result.data.ranking.length > 0) {
            const containner = document.getElementById('sub-leaderboard')
            containner.innerHTML = ''
            const rank = await result.data.ranking?.findIndex(data => data.role == 'you') + 1
            await result.data.ranking?.map(data => {
              if (data.role == 'you')
                totalScore = data.score
              if (data.rank == 1) {
                if (data.role == 'you') {
                  document.getElementById('first_you').style.display = 'block'
                } else {
                  document.getElementById('first_you').style.display = 'none'
                }
                document.getElementById('first_place-name').innerHTML = data.name
                document.getElementById('first_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('first_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 1
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 2) {
                if (data.role == 'you') {
                  document.getElementById('second_you').style.display = 'block'
                } else {
                  document.getElementById('second_you').style.display = 'none'
                }
                document.getElementById('second_place-name').innerHTML = data.name
                document.getElementById('second_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('second_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 2
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 3) {
                if (data.role == 'you') {
                  document.getElementById('third_you').style.display = 'block'
                } else {
                  document.getElementById('third_you').style.display = 'none'
                }
                document.getElementById('third_place-name').innerHTML = data.name
                document.getElementById('third_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('third_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 3
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank >= rank - 10 && rank <= rank + 10) {
                const card = document.createElement("div")
                card.classList.add("card-leaderboard")
                if (data.role == 'you')
                  card.classList.add("blue-border")
                // card.id = data.role
                const content = `
                ${data.role == 'you' ? `<img id='you' class="you" style="z-index: 1000;" src="./img/you.png">` : ''}
                <div class="d-flex">
                  <div style="width: 15%;padding-left: 2px;">
                    ${data.rank}
                  </div>
                  <div class="name" style="width: 40%;text-align: left;">
                    ${data.name}
                  </div>
                  <div class="" style="width: 25%;">
                    <span class="text-sm">เบอร์</span><span class="text-s">${data.phone.slice(-4)}</span>
                  </div>
                  <div class="color-red" style="width: 20%;padding-right: 2px;">
                    ${data.score}
                  </div>
                </div>
              `
                card.innerHTML = content;
                containner.appendChild(card)
              }
            })
            window.location.href = '#you'
          }
          // if (result.data.yourRank) {
          //   totalScore = result.data.yourRank[0].score
          //   document.getElementById('sub-leaderboard').style.height = '35%'
          //   document.getElementById('fix-leaderboard').style.display = 'block'
          //   document.getElementById('yourRank').innerHTML = result.data.yourRank[0].role
          //   document.getElementById('yourName').innerHTML = ' ' + result.data.yourRank[0].phone.slice(-4)
          //   document.getElementById('yourPhone').innerHTML = `<span class="text-sm">เบอร์</span><span class="text-s">${result.data.phone.slice(-4)}</span>`
          //   document.getElementById('yourScore').innerHTML = result.data.yourRank[0].score
          // } else {
          document.getElementById('sub-leaderboard').style.height = '54%'
          document.getElementById('fix-leaderboard').style.display = 'none'
          // }
        })
    }).catch((err) => {
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

function getElementPosition(elementId) {
  // Get the element
  var element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return null;
  }

  // Get the bounding client rect
  var rect = element.getBoundingClientRect();

  // Get the x and y position
  var x = rect.left + window.scrollX;
  var y = rect.top + window.scrollY;

  return { x: x, y: y };
}

function getRandomNumber() {
  random = Math.random()
  ind = Math.floor(Math.random() * 16) + 1
}

function getRandomNumber_2() {
  random_2 = Math.random()
  ind2 = Math.floor(Math.random() * 16) + 1
}

function submit(e) {
  const phone = document.getElementById('phone')
  const thankyou = document.getElementById('thankyou-containner')
  const result = document.getElementById('result-containner')
  const thankRank = document.getElementById('thankRank')
  const thankName = document.getElementById('thankName')
  const thankPhone = document.getElementById('thankPhone')
  const thankScore = document.getElementById('thankScore')
  e.preventDefault();
  axios.post(`${api}/game/save`, { uid: localStorage.getItem('uid'), phone: (phone.value).toString(), score: score.toString() })
    .then(res => {
      thankRank.innerHTML = res.data.rank
      thankName.innerHTML = res.data.name
      thankPhone.innerHTML = `<span class="text-sm">เบอร์</span><span class="text-s">${res.data.phone.slice(-4)}</span>`
      thankScore.innerHTML = res.data.score
      result.style.display = 'none'
      thankyou.style.display = 'block'
      window.localStorage.setItem('phone', phone.value)
      document.getElementById('result-form-phone').style.display = 'block'
    }).catch((err) => {
      console.log('err', err)
      window.localStorage.removeItem('phone')
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

async function updateFootballPosition() {
  const football = document.getElementById('football')
  const ball1 = document.getElementById('ball1')
  const ball2 = document.getElementById('ball2')
  const football_2 = document.getElementById('football_2')
  const bonus = document.getElementById(`bonus${bonusCount}`)
  const bomb = document.getElementById('bomb')
  const bomb_2 = document.getElementById('bomb_2')
  timeCounter += 5 // 16.7
  timeCounter_2 += 5
  const percen = timeCounter / (moveUpTime / hardLevel)
  const percen_2 = timeCounter_2 / (moveUpTime / hardLevel)
  if (percen_2 < 100 && cooldown_2 == 0 && !isOver) {
    if (random_2 >= ((totalScore > 1999) ? 0.4 : (totalScore > 800) ? 0.6 : 0.8)) {
      bomb_2.style.width = 50 + (percen_2 + 8) + 'px'
      bomb_2.style.height = 50 + percen_2 + 'px'
      bomb_2.style.display = 'block';
    } else {
      football_2.style.width = 50 + percen_2 + 'px'
      football_2.style.height = 50 + percen_2 + 'px'
      football_2.style.display = 'block';
      ball2.style.rotate = percen_2 * 2 + 'deg'
    }
    footballX_2 += pattern[ind2][2] * (hardLevel)// Update X position
    footballY_2 += pattern[ind2][3] * (hardLevel)// Update Y position
  } else {
    timeCounter_2 = 0
    football_2.style.display = 'none'
    bomb_2.style.display = 'none';
    footballX_2 = pattern[ind2][0] // Reset X position
    footballY_2 = pattern[ind2][1] // Reset Y position
  }
  if (percen < 100 && cooldown == 0 && !isOver) {
    if (random >= ((totalScore > 1999) ? 0.4 : (totalScore > 800) ? 0.6 : 0.8)) {
      bomb.style.width = 50 + (percen + 8) + 'px'
      bomb.style.height = 50 + percen + 'px'
      bomb.style.display = 'block';
      // bomb.style.rotate = percen * 1.70 + 'deg'
    } else if (random >= ((totalScore > 1999) ? 0.3 : (totalScore > 800) ? 0.4 : 0.5)) {
      bonusCheck = true
      bonus.style.width = 50 + percen + 'px'
      bonus.style.height = 'auto'
      bonus.style.display = 'block';
      // bonus.style.rotate = percen * 1.70 + 'deg'
    } else {
      football.style.width = 50 + percen + 'px'
      football.style.height = 50 + percen + 'px'
      football.style.display = 'block';
      ball1.style.rotate = percen * 2 + 'deg'
    }
    footballX += pattern[ind][2] * (hardLevel)// Update X position
    footballY += pattern[ind][3] * (hardLevel)// Update Y position
  } else {
    timeCounter = 0
    football.style.display = 'none';
    football.style.width = 50 + 'px'
    football.style.height = 50 + 'px'
    bonus.style.display = 'none';
    bonus.style.width = 50 + 'px'
    bonus.style.height = 50 + 'px'
    bomb.style.display = 'none';
    bomb.style.width = 50 + 'px'
    bomb.style.height = 50 + 'px'
    footballX = pattern[ind][0] // Reset X position
    footballY = pattern[ind][1] // Reset Y position
    if (bonusCheck) {
      bonusCount < 3 ? bonusCount++ : bonusCount = 1
      bonusCheck = false
    }
  }


  football_2.style.top = footballY_2 + 'px';
  football_2.style.left = footballX_2 + 'px';
  bomb_2.style.top = footballY_2 + 'px';
  bomb_2.style.left = footballX_2 + 'px';
  football.style.left = footballX + 'px';
  football.style.top = footballY + 'px';
  bonus.style.left = footballX + 'px';
  bonus.style.top = footballY + 'px';
  bomb.style.left = footballX + 'px';
  bomb.style.top = footballY + 'px';
  if (!isOver) {
    if (cooldown > 0 || cooldown_2 > 0) {
      cooldown > 0 && cooldown--
      cooldown_2 > 0 && cooldown_2--
    }
    if (percen >= 100) {
      if (bonusCheck) {
        bonusCount < 3 ? bonusCount++ : bonusCount = 1
        bonusCheck = false
      }
      cooldown = 100
      getRandomNumber()
    }
    if (percen_2 >= 100) {
      cooldown_2 = 200
      getRandomNumber_2()
    }
  }
  requestAnimationFrame(updateFootballPosition); // Update position in the next frame
}

document.getElementById('result-form').addEventListener('submit', function (event) {
  submit(event)
})
document.getElementById('football').addEventListener('touchstart', function (event) {
  var touch = event.touches[0]
  var x = touch.clientX
  var y = touch.clientY
  const img = document.createElement('img')
  img.classList.add('gotone')
  img.src = './img/gotone.png'
  img.style.left = x + 'px'
  img.style.top = y + 'px'
  document.getElementById('containner').appendChild(img)
  score +=scoreA
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score
  document.getElementById('score-sum').textContent = score
  getRandomNumber()
  cooldown = 100
  const gotone = document.getElementById('gotone')
  const audio = new Audio("gotone.mp3");
  audio.play()
  // gotone.style.display = 'block'
  setTimeout(() => {
    img.remove()
    // gotone.style.display = 'none'
  }, 200)
})

document.getElementById('football_2').addEventListener('touchstart', function (event) {
  var touch = event.touches[0]
  var x = touch.clientX
  var y = touch.clientY
  const img = document.createElement('img')
  img.classList.add('gotone')
  img.src = './img/gotone.png'
  img.style.left = x + 'px'
  img.style.top = y + 'px'
  document.getElementById('containner').appendChild(img)
  score += scoreA
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score
  document.getElementById('score-sum').textContent = score
  getRandomNumber_2()
  cooldown_2 = 150
  const gotone = document.getElementById('gotone')
  const audio = new Audio("gotone.mp3");
  audio.play()
  // gotone.style.display = 'block'
  setTimeout(() => {
    img.remove()
    // gotone.style.display = 'none'
  }, 200)
})

function bonusClick(event) {
  hand.classList.add('active')
  var touch = event.touches[0]
  var x = touch.clientX
  var y = touch.clientY
  const img = document.createElement('img')
  img.classList.add('gotone')
  img.src = './img/gottwo.png'
  img.style.left = x + 'px'
  img.style.top = y + 'px'
  document.getElementById('containner').appendChild(img)
  score += scoreB
  bonusCheck = true
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score
  document.getElementById('score-sum').textContent = score
  getRandomNumber()
  cooldown = 100
  const gotone = document.getElementById('gottwo')
  const audio = new Audio("gottwo.mp3");
  audio.play()
  // gotone.style.display = 'block'
  setTimeout(() => {
    img.remove()
    // gotone.style.display = 'none'
  }, 200)
}
function bombClick(element) {
  hand.classList.add('active')
  const audio = new Audio("bomb.mp3");
  audio.play()
  gameOver()
}

document.getElementById('bonus1').addEventListener('touchstart', function (event) {
  bonusClick(event)
})
document.getElementById('bonus2').addEventListener('touchstart', function (event) {
  bonusClick(event)
})
document.getElementById('bonus3').addEventListener('touchstart', function (event) {
  bonusClick(event)
})

document.getElementById('bomb').addEventListener('touchstart', function () {
  bombClick(this)
})

document.getElementById('bomb_2').addEventListener('touchstart', function () {
  bombClick(this)
})

const setTimer = () => {
  document.getElementById('time').innerHTML = `${Math.floor(timeLimitLevel / 2)}:${timeLimitLevel % 2 == 0 ? '00' : '30'}`
  let timer = 0
  const limitTimer = 30 * timeLimitLevel
  const countTimer = setInterval(() => {
    timer++
    const leftTime = limitTimer - timer
    const minute = Math.floor(leftTime / 60)
    document.getElementById('time').innerHTML = `${minute}:${(leftTime % 60) > 9 ? '' : '0'}${leftTime % 60}`
    if (timer == limitTimer) {
      gameOver()
      clearInterval(countTimer)
    }
    if (isOver == true) {
      clearInterval(countTimer)
    }
  }, 1000)
}
const startGame = () => {
  checkStart()
  score = 0
  document.getElementById('time').innerHTML = '0:00'
  document.getElementById('score-sum').textContent = 0
  document.getElementById('score-value').textContent = 0
  document.getElementById('start-containner').style.display = 'none'
  document.getElementById('thankyou-containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'none'
  document.getElementById('containner').style.display = 'block'
  let countdownValue = 3
  const myCountdown = setInterval(() => {
    document.getElementById('countdown-section').style.display = 'none'
    document.getElementById('countdown-section').style.display = 'block'
    countdownValue--
    document.getElementById('countdown-number').innerHTML = countdownValue == 0 ? 'GO!' : countdownValue
    if (countdownValue < 0) {
      clearInterval(myCountdown)
      document.getElementById('countdown-section').style.display = 'none'
      setTimer()
      isOver = false
      // updateFootballPosition()
    }
  }, 1000)
}
updateFootballPosition()
const audio1 = document.getElementById("background-music");
audio1.volume = 0.5
function playMusic() {
  audio1.play();
}
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.origin) {
    getStart()
  }
  // var container = document.getElementById("containner")
  // var handImage = document.getElementById("hand")
  // container.addEventListener("mousedown", function (event) {

  //   // Prevent default click behavior
  //   event.preventDefault();

  //   // Calculate click position relative to container
  //   var rect = container.getBoundingClientRect();
  //   var x = event.clientX - rect.left;
  //   var y = event.clientY - rect.top;

  //   // Set hand image position
  //   handImage.style.left = x + "px";
  //   handImage.style.top = y + "px";

  //   // Show hand image
  //   handImage.classList.remove("hidden");

  //   // Hide hand image after 1 second
  //   setTimeout(function () {
  //     handImage.classList.add("hidden");
  //   }, 300);
  // });
})
//ปิดtab
// window.addEventListener('beforeunload', function (event) {
//   // Cancel the event
//   event.preventDefault()
//   time -= -this.performance.now()
//   // Chrome requires returnValue to be set
//   axios.post(`${api}/game/timerecord`, { time: Math.floor(time / 1000) })
//     .then(() => {
//     }).catch((err) => {
//       console.log(err)
//     })
// });
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  // Mobile device detected
} else {
  window.location.href = '/notsupport'
}

document.addEventListener('dragstart', function (event) {
  event.preventDefault()
})
document.addEventListener('touchstart', event => {
  event.preventDefault()
})
function openModal() {
  $('#exampleModalLong').modal('show')
}