// let time = performance.now()
let score = 0;
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
let direction = 0
let moveUpTime = 7; // Duration of moving upwards (1 second)
let timeCounter = 0
let timeCounter_2 = 0
let cooldown = 0
let cooldown_2 = 0
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
      if (result.data.server_status.server_status != 1)
        throw new Error('server is offline')
      if (result?.data?.user.length > 0) {
        window.localStorage.setItem('uid', result.data.user[0].uid)
        window.localStorage.setItem('name', result.data.user[0].name)
        window.localStorage.setItem('image', result.data.user[0].picture)
        totalScore = result.data.user[0].score
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
  const phone = window.localStorage.getItem('phone')
  document.getElementById('containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'block'
  if (phone) {
    document.getElementById('result-form').style.display = 'none'
  } else {
    document.getElementById('result-form-phone').style.display = 'none'
  }
  check = true
  axios.post(`${api}/game/save`, { uid: localStorage.getItem('uid'), name: localStorage.getItem('name'), score: score.toString() })
    .then(() => {
      axios.get(`${api}/game/getranking?uid=${window.localStorage.getItem('uid')}`)
        .then(async result => {
          if (result.data.ranking.length > 0) {
            const containner = document.getElementById('sub-leaderboard')
            await result.data.ranking?.map(data => {
              if (data.role == 'you')
                totalScore = data.score
              if (data.rank == 1) {
                document.getElementById('first_place-img').style.display = 'inline-block'
                document.getElementById('first_place-name').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('first_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 1
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 2) {
                document.getElementById('second_place-img').style.display = 'inline-block'
                document.getElementById('second_place-name').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('second_place-score').innerHTML = data.score
                document.getElementById('thankRank').innerHTML = 2
                document.getElementById('thankName').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
                document.getElementById('thankScore').innerHTML = data.score
              } else if (data.rank == 3) {
                document.getElementById('third_place-img').style.display = 'inline-block'
                document.getElementById('third_place-name').innerHTML = `เบอร์\n${data.phone.slice(-4)}`
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
                ${data.role == 'you' ? '<img class="you" style="z-index: 1000;" src="./img/you.png">' : ''}
                <div class="d-flex">
                    <div style="width: 20%;">
                    ${data.rank}
                    </div>
                    <div class="name" style="width: 50%;">
                    <img class="user-img" src="./img/user.png" style="width: 20px;height: auto;">
                    เบอร์ลงท้าย${data.phone.slice(-4)}
                    </div>
                    <div class="color-red" style="width: 30%;">
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
            document.getElementById('yourRank').innerHTML = result.data.yourRank[0].role
            document.getElementById('yourName').innerHTML = '<img class="user-img" src="./img/user.png" style="width: 20px;height: auto;">' + ' ' + 'เบอร์ลงท้าย' + result.data.yourRank[0].phone.slice(-4)
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

  direction = Math.random() * 3
  dx = randomNumberX
  dy = randomNumberY
}

function getRandomNumber_2() {
  random_2 = Math.random()
  dx_2 = -dx
  dy_2 = -dy
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
  const phone = document.getElementById('phone')
  const thankyou = document.getElementById('thankyou-containner')
  const result = document.getElementById('result-containner')
  const thankRank = document.getElementById('thankRank')
  const thankName = document.getElementById('thankName')
  const thankScore = document.getElementById('thankScore')
  e.preventDefault();
  axios.post(`${api}/game/save`, { uid: localStorage.getItem('uid'), phone: (phone.value).toString() })
    .then(res => {
      thankRank.innerHTML = res.data.rank
      thankName.innerHTML = `เบอร์ลงท้าย${res.data.phone.slice(-4)}`
      thankScore.innerHTML = res.data.score
      result.style.display = 'none'
      thankyou.style.display = 'block'
      window.localStorage.setItem('phone', phone.value)
      document.getElementById('result-form-phone').style.display = 'block'
    }).catch((err) => {
      console.log(err)
      alert('การบันทึกไม่สำเร็จ กรุณาลองใหม่ภายหลัง')
    })
}

async function updateFootballPosition() {
  const football = document.getElementById('football')
  const football_2 = document.getElementById('football_2')
  const bonus = document.getElementById(`bonus${bonusCount}`)
  const bomb = document.getElementById('bomb')
  const bomb_2 = document.getElementById('bomb_2')
  timeCounter += 5 // 16.7
  timeCounter_2 += 5
  const percen = timeCounter / (moveUpTime / hardLevel)
  const percen_2 = timeCounter_2 / (moveUpTime / hardLevel)
  if (percen_2 < 100 && cooldown_2 == 0 && !isOver) {
    if (random_2 > (totalScore > 3000 ? 0.5 : totalScore > 2000 ? 0.6 : totalScore > 1000 ? 0.7 : 0.8)) {
      bomb_2.style.width = 50 + (percen_2 + 8) + 'px'
      bomb_2.style.height = 50 + percen_2 + 'px'
      bomb_2.style.display = 'block';
    } else {
      football_2.style.width = 50 + percen_2 + 'px'
      football_2.style.height = 50 + percen_2 + 'px'
      football_2.style.display = 'block';
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
    if (random > (totalScore > 3000 ? 0.5 : totalScore > 2000 ? 0.6 : totalScore > 1000 ? 0.7 : 0.8)) {
      bomb.style.width = 50 + (percen + 8) + 'px'
      bomb.style.height = 50 + percen + 'px'
      bomb.style.display = 'block';
      // bomb.style.rotate = percen * 1.70 + 'deg'
    } else if (random > totalScore > 3000 ? 0.4 : 0.5) {
      bonus.style.width = 50 + percen + 'px'
      bonus.style.height = 'auto'
      bonus.style.display = 'block';
      // bonus.style.rotate = percen * 1.70 + 'deg'
    } else {
      football.style.width = 50 + percen + 'px'
      football.style.height = 50 + percen + 'px'
      football.style.display = 'block';
      // football.style.rotate = percen * 1.70 + 'deg'
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
      cooldown = 200
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
  cooldown = 200
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
  score += 3
  bonusCheck = true
  hardLevel = (Math.floor(score / 5) * 0.2) + defaultHardLevel
  document.getElementById('score-value').textContent = score;
  document.getElementById('score-sum').textContent = score;
  getRandomNumber()
  cooldown = 200
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
  document.getElementById('start-containner').style.display = 'none'
  document.getElementById('thankyou-containner').style.display = 'none'
  document.getElementById('result-containner').style.display = 'none'
  document.getElementById('containner').style.display = 'block'
  let countdownValue = 3
  score = 0
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
      updateFootballPosition()
    }
  }, 1000)
}

document.addEventListener("DOMContentLoaded", function () {
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