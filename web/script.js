let time = performance.now()
let score = 0;
let footballX = window.innerWidth / 2; // Initial X position
let footballY = window.innerHeight / 2; // Start at the bottom of the screen
let footballX_2 = window.innerWidth / 2; // Initial X position
let footballY_2 = window.innerHeight / 2; // Start at the bottom of the screen
let isBonus = 0
let random = 0
let random_2 = 0
let bonusCount = 1
let dx = 0 // Initial horizontal velocity
let dy = 0 // Velocity for moving upwards
let dx_2 = 0 // Initial horizontal velocity
let dx1_2 = 0
let dy_2 = 0 // Velocity for moving upwards
let dy1_2 = 0
let direction = 0
let direction_2 = 0
let moveUpTime = 7; // Duration of moving upwards (1 second)
let timeCounter = 0
let timeCounter_2 = 0
let check = false
let check_2 = false
let bonusCheck = false
let defaultHardLevel = 0.5
let hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
let isOver = false
const api = 'http://localhost:3000'
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
        axios.post('https://central-game-api.ants.co.th/game/getuser', {
          token: token
        }).then(result => {
          if (result.data) {
            window.localStorage.setItem('uid', result.data.aud)
            window.localStorage.setItem('name', result.data.name)
            window.localStorage.setItem('image', result.data.picture)
          }
        })
      }
    })
  } else {
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2004588192&redirect_uri=https://central-game.ants.co.th&state=${new Date().getTime()}&scope=profile%20openid`
  }
}

//getstart
getStart()
function getStart() {
  axios.get(`${api}/game/getstart`)
    .then(result => {
      if (result?.data?.user.length > 0) {
        if (result.data.user[0].server_status != 1)
          throw new Error('server is offline')
        window.localStorage.setItem('uid', result.data.user[0].uid)
        window.localStorage.setItem('name', result.data.user[0].name)
        window.localStorage.setItem('image', result.data.user[0].picture)

        if (result.data.user[0].phone)
          window.localStorage.setItem('phone', result.data.user[0].phone)

        defaultHardLevel = result.data.user[0].level
      }
    }).catch(() => {
      const start = document.getElementById('start-containner')
      const maintain = document.getElementById('maintain-containner')
      maintain.style.display = 'block'
      start.style.display = 'none'
    })
}

function gameOver() {
  isOver = true
  hardLevel = defaultHardLevel
  document.getElementById('countdown-number').innerHTML = 3
  document.getElementById('countdown-section').style.display = 'block'
  $('#exampleModalCenter').modal('show')
  const phone = window.localStorage.getItem('phone')
  document.getElementById('containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'block'
  if (phone) {
    document.getElementById('result-form').style.display = 'none'
  } else {
    document.getElementById('result-form-phone').style.display = 'none'
  }
  check = true
  axios.post(`${api}/game/save`, { uid: '12345', name: 'pawat', score: score.toString() })
    .then(() => {
      axios.get(`${api}/game/getranking?uid=${window.localStorage.getItem('uid')}`)
        .then(async result => {
          if (result.data.ranking.length > 0) {
            const containner = document.getElementById('sub-leaderboard')
            await result.data.ranking?.map((data, index) => {
              if (index == 0) {
                document.getElementById('first_place-name').innerHTML = data.name
                document.getElementById('first_place-score').innerHTML = data.score
              } else if (index == 1) {
                document.getElementById('second_place-name').innerHTML = data.name
                document.getElementById('second_place-score').innerHTML = data.score
              } else if (index == 2) {
                document.getElementById('third_place-name').innerHTML = data.name
                document.getElementById('third_place-score').innerHTML = data.score
              } else {
                const card = document.createElement("div")
                card.classList.add("card-leaderboard")
                if (data.role == 'you')
                  card.classList.add("blue-border")
                card.id = data.role
                const content = `
                ${data.role == 'you' ? '<img class="you" style="z-index: 1000;" src="./img/you.png">' : ''}
                <div class="d-flex">
                    <div>
                    ${data.rank}
                    </div>
                    <div class="name">
                    <img class="user-img" src="./img/user.png" style="width: 20px;height: auto;">
                    ${data.name}
                    </div>
                    <div class="color-red">
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
          if (result.data.yourRank) {
            document.getElementById('sub-leaderboard').style.height = '35%'
            document.getElementById('fix-leaderboard').style.display = 'block'
            document.getElementById('yourRank').innerHTML = result.data.yourRank[0].role
            document.getElementById('yourName').innerHTML = '<img class="user-img" src="./img/user.png" style="width: 20px;height: auto;">' + ' ' + result.data.yourRank[0].name
            document.getElementById('yourScore').innerHTML = result.data.yourRank[0].score
          } else {
            document.getElementById('sub-leaderboard').style.height = '50%'
            document.getElementById('fix-leaderboard').style.display = 'none'
          }
        })
    }).catch((err) => {
      console.log(err)
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

function asyncFunction() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched successfully");
    }, 700);
  });
}

function getRandomNumber() {
  var randomNumberX = Math.random() * -3; //0 to -3
  var randomNumberY = Math.random() * 4 - 3; // 1 to -3
  var randomNumberX2 = Math.random() * -3; //0 to -3
  var randomNumberY2 = Math.random() * 4 - 3; // 1 to -3
  random = Math.random()

  direction = Math.random() * 3
  dx = randomNumberX
  dy = randomNumberY
  dx_2 = randomNumberX2
  dy_2 = randomNumberY2
}

function getRandomNumber_2() {
  var randomNumberX = Math.random() * -3; //0 to -3
  var randomNumberY = Math.random() * 4 - 3; // 1 to -3
  random = Math.random()

  direction_2 = Math.random() * 3
  dx_2 = randomNumberX
  dx1_2 = -randomNumberX
  dy_2 = randomNumberY
  dy1_2 = -randomNumberY
}

function increaseLevel() {
  hardLevel++
  const level = document.getElementById('level')
  level.value = hardLevel
}
function decreaseLevel() {
  hardLevel--
  const level = document.getElementById('level')
  level.value = hardLevel
}

function submit(e) {
  // const name = document.getElementById('name')
  const phone = document.getElementById('phone')
  const btn = document.getElementById('submitBtn')
  const thankyou = document.getElementById('thankyou-containner')
  const result = document.getElementById('result-containner')
  e.preventDefault();
  axios.post(`${api}/game/save`, { uid: '12345', phone: phone.value })
    .then(() => {
      result.style.display = 'none'
      thankyou.style.display = 'block'
      document.getElementById('thank-card').innerHTML = document.getElementById('you').innerHTML
    }).catch((err) => {
      console.log(err)
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

async function updateFootballPosition() {
  const football = document.getElementById('football')
  // const football_2 = document.getElementById('football_2')
  const bonus = document.getElementById(`bonus${bonusCount}`)
  const bomb = document.getElementById('bomb')
  timeCounter += 16.7
  const percen = timeCounter / (moveUpTime / hardLevel)
  // timeCounter_2 += 16.7
  // const percen_2 = (timeCounter_2 / (moveUpTime / hardLevel))
  // if (percen_2 < 100 && !check_2) {
  //   football_2.style.display = 'block';
  //   football_2.style.width = 50 + percen + 'px'
  //   football_2.style.height = 50 + percen + 'px'
  //   footballX_2 -= dx * (hardLevel)// Update X position
  //   footballY_2 -= dy * (hardLevel)// Update Y position
  // } else {
  //   timeCounter_2 = 0
  //   football_2.style.display = 'none'
  //   football_2.style.width = 50 + 'px'
  //   football_2.style.height = 50 + 'px'
  //   footballX_2 = window.innerWidth / 2 // Reset X position
  //   footballY_2 = window.innerHeight / 2 // Reset Y position
  // }
  if (percen < 100 && !check) {
    if (random > 0.8) {
      bomb.style.display = 'block';
      bomb.style.width = 50 + (percen + 8) + 'px'
      bomb.style.height = 50 + percen + 'px'
      // bomb.style.rotate = percen * 1.70 + 'deg'
      footballX += dx * (hardLevel) // Update X position
      footballY += dy * (hardLevel) // Update Y position
    } else if (random > 0.5) {
      bonus.style.display = 'block';
      bonus.style.width = 50 + percen + 'px'
      bonus.style.height = 'auto'
      // bonus.style.rotate = percen * 1.70 + 'deg'
      footballX += dx * (hardLevel) // Update X position
      footballY += dy * (hardLevel)// Update Y position
    } else {
      football.style.display = 'block';
      football.style.width = 50 + percen + 'px'
      football.style.height = 50 + percen + 'px'
      // football.style.rotate = percen * 1.70 + 'deg'
      footballX += dx * (hardLevel)// Update X position
      footballY += dy * (hardLevel)// Update Y position
    }
  } else {
    football.style.display = 'none';
    bonus.style.display = 'none';
    bomb.style.display = 'none';
    timeCounter = 0
    football.style.width = 50 + 'px'
    football.style.height = 50 + 'px'
    bonus.style.width = 50 + 'px'
    bonus.style.height = 50 + 'px'
    bomb.style.width = 50 + 'px'
    bomb.style.height = 50 + 'px'
    footballX = window.innerWidth / 2 // Reset X position
    footballY = window.innerHeight / 2 // Reset Y position
    getRandomNumber()
    if (bonusCheck) {
      bonusCount < 3 ? bonusCount++ : bonusCount = 1
      bonusCheck = false
    }
    if (isBonus === 4) {
      isBonus = 0
      bonusCount <= 3 ? bonusCount++ : bonusCount = 1
    }
  }


  // football_2.style.top = footballY_2 + 'px';
  // football_2.style.left = footballX_2 + 'px';
  football.style.left = footballX + 'px';
  football.style.top = footballY + 'px';
  bonus.style.left = footballX + 'px';
  bonus.style.top = footballY + 'px';
  bomb.style.left = footballX + 'px';
  bomb.style.top = footballY + 'px';

  if (!isOver) {
    requestAnimationFrame(updateFootballPosition); // Update position in the next frame
    if (percen < 100 && !check) {
      // requestAnimationFrame(updateFootballPosition); // Update position in the next frame
    } else {
      asyncFunction().then(() => {
        check = false
        check_2 = false
        // requestAnimationFrame(updateFootballPosition); // Update position in the next frame
      })
    }
  }
}

async function updateFootballPosition2() {
  const football = document.getElementById('football_2')
  const bonus = document.getElementById(`bonus${bonusCount}_2`)
  const bomb = document.getElementById('bomb_2')
  timeCounter_2 += 16.7
  const percen2 = timeCounter_2 / (moveUpTime / hardLevel)
  if (percen2 < 100 && !check) {
    if (random > 0.8) {
      bomb.style.display = 'block';
      bomb.style.width = 50 + (percen2 + 8) + 'px'
      bomb.style.height = 50 + percen2 + 'px'
      // bomb.style.rotate = percen2 * 1.70 + 'deg'
      footballX += dx * (hardLevel) // Update X position
      footballY += dy * (hardLevel) // Update Y position
    } else if (random > 0.5) {
      bonus.style.display = 'block';
      bonus.style.width = 50 + percen2 + 'px'
      bonus.style.height = 'auto'
      // bonus.style.rotate = percen2 * 1.70 + 'deg'
      footballX += dx * (hardLevel) // Update X position
      footballY += dy * (hardLevel)// Update Y position
    } else {
      football.style.display = 'block';
      football.style.width = 50 + percen2 + 'px'
      football.style.height = 50 + percen2 + 'px'
      // football.style.rotate = percen2 * 1.70 + 'deg'
      footballX += dx * (hardLevel)// Update X position
      footballY += dy * (hardLevel)// Update Y position
    }
  } else {
    football.style.display = 'none';
    bonus.style.display = 'none';
    bomb.style.display = 'none';
    timeCounter_2 = 0
    football.style.width = 50 + 'px'
    football.style.height = 50 + 'px'
    bonus.style.width = 50 + 'px'
    bonus.style.height = 50 + 'px'
    bomb.style.width = 50 + 'px'
    bomb.style.height = 50 + 'px'
    footballX = window.innerWidth / 2 // Reset X position
    footballY = window.innerHeight / 2 // Reset Y position
    getRandomNumber_2()
    if (bonusCheck) {
      bonusCount < 3 ? bonusCount++ : bonusCount = 1
      bonusCheck = false
    }
    if (isBonus === 4) {
      isBonus = 0
      bonusCount <= 3 ? bonusCount++ : bonusCount = 1
    }
  }

  football.style.left = footballX + 'px';
  football.style.top = footballY + 'px';
  bonus.style.left = footballX + 'px';
  bonus.style.top = footballY + 'px';
  bomb.style.left = footballX + 'px';
  bomb.style.top = footballY + 'px';
}

document.getElementById('result-form').addEventListener('submit', function (event) {
  submit(event)
})
document.getElementById('football').addEventListener('mousedown', function () {
  score++
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  check = true
  this.style.top = Math.floor(window.innerWidth / 2) + 'px';
  this.style.left = Math.floor(window.innerWidth / 2) + 'px';
  const gotone = document.getElementById('gotone')
  const audio = new Audio("gotone.mp3");
  audio.play()
  gotone.style.display = 'block'
  setTimeout(() => {
    gotone.style.display = 'none'
  }, 200)
})

// document.getElementById('football_2').addEventListener('mousedown', function () {
//   score++
//   hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
//   document.getElementById('score-value').textContent = score;
//   document.getElementById('score-sum').textContent = score;
//   check_2 = true
//   this.style.top = Math.floor(window.innerWidth / 2) + 'px';
//   this.style.left = Math.floor(window.innerWidth / 2) + 'px';
//   const gotone = document.getElementById('gotone')
//   const audio = new Audio("gotone.mp3");
//   audio.play()
//   gotone.style.display = 'block'
//   setTimeout(() => {
//     gotone.style.display = 'none'
//   }, 200)
// })

function bonusClick(element) {
  score += 3
  bonusCheck = true
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  check = true
  element.style.top = Math.floor(window.innerWidth / 2) + 'px';
  element.style.left = Math.floor(window.innerWidth / 2) + 'px';
  const gotone = document.getElementById('gottwo')
  const audio = new Audio("gottwo.mp3");
  audio.play()
  gotone.style.display = 'block'
  setTimeout(() => {
    gotone.style.display = 'none'
  }, 200)
}

document.getElementById('bonus1').addEventListener('mousedown', function () {
  bonusClick(this)
})
document.getElementById('bonus2').addEventListener('mousedown', function () {
  bonusClick(this)
})
document.getElementById('bonus3').addEventListener('mousedown', function () {
  bonusClick(this)
})

document.getElementById('bomb').addEventListener('mousedown', function () {
  const audio = new Audio("bomb.mp3");
  audio.play()
  gameOver()
  this.style.top = Math.floor(window.innerWidth / 2) + 'px';
  this.style.left = Math.floor(window.innerWidth / 2) + 'px';
})

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('football').style.top = footballY + 'px';
  document.getElementById('football').style.left = footballX + 'px';
})

const setTimer = () => {
  console.log('timer start')
  let timer = 0
  const limitTimer = 30 * timeLimitLevel
  const countTimer = setInterval(() => {
    timer++
    const leftTime = limitTimer - timer
    document.getElementById('time').innerHTML = `${(leftTime / 60).toFixed(0)}:${(leftTime % 60) > 9 ? '' : '0'}${leftTime % 60}`
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
  score = 0
  document.getElementById('score-value').textContent = 0
  // document.getElementById('countdown-number').innerHTML = 3
  // document.getElementById('countdown-section').style.display = 'block'
  document.getElementById('start-containner').style.display = 'none'
  document.getElementById('thankyou-containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'none'
  document.getElementById('containner').style.display = 'block'
  let countdownValue = 3
  score = 0
  isOver = false
  const myCountdown = setInterval(() => {
    document.getElementById('countdown-section').style.display = 'none'
    document.getElementById('countdown-section').style.display = 'block'
    countdownValue--
    document.getElementById('countdown-number').innerHTML = countdownValue == 0 ? 'GO!' : countdownValue
    if (countdownValue < 0) {
      clearInterval(myCountdown)
      document.getElementById('countdown-section').style.display = 'none'
      setTimer()
      updateFootballPosition()
      updateFootballPosition2()
    }
  }, 1000)
}

document.getElementById('startBtn').addEventListener('click', (event) => {
  event.target.innerHTML = 2
  document.getElementById('startBtn').style.pointerEvents = 'none';
  countdown(event.target)
})

//ปิดtab
window.addEventListener('beforeunload', function (event) {
  // Cancel the event
  event.preventDefault()
  time -= -this.performance.now()
  // Chrome requires returnValue to be set
  axios.post(`${api}/game/timerecord`, { time: Math.floor(time / 1000) })
    .then(() => {
    }).catch((err) => {
      console.log(err)
    })
});