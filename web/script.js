// let time = performance.now()
let rank = 999
let score = 0
let totalScore = 0
let footballX = window.innerWidth / 2; // Initial X position
let footballY = window.innerHeight / 2; // Start at the bottom of the screen
let footballX_2 = window.innerWidth / 2; // Initial X position
let footballY_2 = window.innerHeight / 2; // Start at the bottom of the screen
let random = 0
let random_2 = 0
let bonusCount = 1
let dx = Math.random() * - 3 // Initial horizontal velocity
let dy = Math.random() * 4 - 3 // Velocity for moving upwards
let dx_2 = 0 // Initial horizontal velocity
let dy_2 = 0 // Velocity for moving upwards
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

//getstart
function getStart() {
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
  isOver = true
  console.log('over')
  // hardLevel = defaultHardLevel
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
            await result.data.ranking?.map(data => {
              if (data.role == 'you')
                totalScore = data.score
              if (data.rank == 1) {
                if (data.role == 'you') {
                  document.getElementById('first_place-img').src = window.localStorage.getItem('image')
                  document.getElementById('first_you').style.display = 'block'
                }
                document.getElementById('first_place-img').style.display = 'inline-block'
                document.getElementById('first_place-name').innerHTML = data.name
                document.getElementById('first_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('first_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 1
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 2) {
                if (data.role == 'you') {
                  document.getElementById('second_place-img').src = window.localStorage.getItem('image')
                  document.getElementById('second_you').style.display = 'block'
                }
                document.getElementById('second_place-img').style.display = 'inline-block'
                document.getElementById('second_place-name').innerHTML = data.name
                document.getElementById('second_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('second_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 2
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 3) {
                if (data.role == 'you') {
                  document.getElementById('third_place-img').src = window.localStorage.getItem('image')
                  document.getElementById('third_you').style.display = 'block'
                }
                document.getElementById('third_place-img').style.display = 'inline-block'
                document.getElementById('third_place-name').innerHTML = data.name
                document.getElementById('third_place-phone').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('third_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 3
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else {
                const card = document.createElement("div")
                card.classList.add("card-leaderboard")
                if (data.role == 'you')
                  card.classList.add("blue-border")
                card.id = data.role
                const content = `
                ${data.role == 'you' ? `<img class="you" style="z-index: 1000;" src="./img/you.png">` : ''}
                <div class="d-flex">
                  <div style="width: 15%;padding-left: 3px;">
                    ${data.rank}
                  </div>
                  <div class="name" style="width: 40%;text-align: left;">
                    <img class="user-img" src="${data.role == 'you' && window.localStorage.getItem('image')}" style="width: 20px;height: auto;" onerror="this.src='./img/user.png'">
                    ${data.name}
                  </div>
                  <div class="" style="width: 25%;">
                    <span class="text-sm">เบอร์</span>${data.phone.slice(-4)}
                  </div>
                  <div class="color-red" style="width: 20%;padding-right: 3px;">
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
            totalScore = result.data.yourRank[0].score
            document.getElementById('sub-leaderboard').style.height = '35%'
            document.getElementById('fix-leaderboard').style.display = 'block'
            document.getElementById('yourImg').src = window.localStorage.getItem('image')
            document.getElementById('yourRank').innerHTML = result.data.yourRank[0].role
            document.getElementById('yourName').innerHTML = ' ' + result.data.yourRank[0].phone.slice(-4)
            document.getElementById('yourPhone').innerHTML = `<span class="text-sm">เบอร์</span>${result.data.phone.slice(-4)}`
            document.getElementById('yourScore').innerHTML = result.data.yourRank[0].score
          } else {
            document.getElementById('sub-leaderboard').style.height = '50%'
            document.getElementById('fix-leaderboard').style.display = 'none'
          }
        })
    }).catch(() => {
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

function getRandomNumber() {
  var randomNumberX = Math.random() * -3 //0 to -3
  var randomNumberY = Math.random() * 4 - 3 // 1 to -3
  random = Math.random()

  dx = randomNumberX
  dy = randomNumberY
}

function getRandomNumber_2() {
  random_2 = Math.random()
  dx_2 = -dx
  dy_2 = -dy
}

function submit(e) {
  const phone = document.getElementById('phone')
  const thankyou = document.getElementById('thankyou-containner')
  const result = document.getElementById('result-containner')
  const thankRank = document.getElementById('thankRank')
  const thankName = document.getElementById('thankName')
  const thankPhone = document.getElementById('thankPhone')
  const thankScore = document.getElementById('thankScore')
  const thankImg = document.getElementById('thankImg')
  e.preventDefault();
  axios.post(`${api}/game/save`, { uid: localStorage.getItem('uid'), phone: (phone.value).toString(), score: score.toString() })
    .then(res => {
      thankImg.src = window.localStorage.getItem('image')
      thankRank.innerHTML = res.data.rank
      thankName.innerHTML = res.data.name
      thankPhone.innerHTML = `<span class="text-sm">เบอร์</span>${res.data.phone.slice(-4)}`
      thankScore.innerHTML = res.data.score
      result.style.display = 'none'
      thankyou.style.display = 'block'
      window.localStorage.setItem('phone', phone.value)
      document.getElementById('result-form-phone').style.display = 'block'
    }).catch((err) => {
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
    if (random_2 >= ((rank < 31 && totalScore > 999) ? 0.5 : 0.8)) {
      bomb_2.style.width = 50 + (percen_2 + 8) + 'px'
      bomb_2.style.height = 50 + percen_2 + 'px'
      bomb_2.style.display = 'block';
    } else {
      football_2.style.width = 50 + percen_2 + 'px'
      football_2.style.height = 50 + percen_2 + 'px'
      football_2.style.display = 'block';
      ball2.style.rotate = percen_2 * 2 + 'deg'
    }
    footballX_2 += dx_2 * (hardLevel)// Update X position
    footballY_2 += dy_2 * (hardLevel)// Update Y position
  } else {
    timeCounter_2 = 0
    football_2.style.display = 'none'
    bomb_2.style.display = 'none';
    footballX_2 = window.innerWidth / 2 // Reset X position
    footballY_2 = window.innerHeight / 2 // Reset Y position
  }
  if (percen < 100 && cooldown == 0 && !isOver) {
    if (random >= ((rank < 31 && totalScore > 999) ? 0.5 : 0.8)) {
      bomb.style.width = 50 + (percen + 8) + 'px'
      bomb.style.height = 50 + percen + 'px'
      bomb.style.display = 'block';
      // bomb.style.rotate = percen * 1.70 + 'deg'
    } else if (random >= ((rank < 31 && totalScore > 999) ? 0.3 : 0.5)) {
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
    footballX += dx * (hardLevel)// Update X position
    footballY += dy * (hardLevel)// Update Y position
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
    footballX = window.innerWidth / 2 // Reset X position
    footballY = window.innerHeight / 2 // Reset Y position
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
document.getElementById('football').addEventListener('mousedown', function () {
  score++
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  getRandomNumber()
  cooldown = 100
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

document.getElementById('football_2').addEventListener('mousedown', function () {
  score++
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  getRandomNumber_2()
  cooldown_2 = 150
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

function bonusClick(element) {
  hand.classList.add('active')
  score += 3
  bonusCheck = true
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  getRandomNumber()
  cooldown = 100
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
function bombClick(element) {
  hand.classList.add('active')
  const audio = new Audio("bomb.mp3");
  audio.play()
  gameOver()
  element.style.top = Math.floor(window.innerWidth / 2) + 'px';
  element.style.left = Math.floor(window.innerWidth / 2) + 'px';
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
  bombClick(this)
})

document.getElementById('bomb_2').addEventListener('mousedown', function () {
  bombClick(this)
})

const setTimer = () => {
  console.log('timer start')
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
function playMusic() {
  audio1.play();
}
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.origin) {
    getStart()
  }
  var container = document.getElementById("containner")
  var handImage = document.getElementById("hand")
  container.addEventListener("mousedown", function (event) {

    // Prevent default click behavior
    event.preventDefault();

    // Calculate click position relative to container
    var rect = container.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Set hand image position
    handImage.style.left = x + "px";
    handImage.style.top = y + "px";

    // Show hand image
    handImage.classList.remove("hidden");

    // Hide hand image after 1 second
    setTimeout(function () {
      handImage.classList.add("hidden");
    }, 300);
  });
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
  // window.location.href = '/notsupport'
}

function openModal() {
  $('#exampleModalLong').modal('show')
}