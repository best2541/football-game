
import http from "k6/http";

export const options = {
    iterations: 10000,
};

export default function () {
    // 2.7 (100) 1m (10000)
    // const res = http.get('http://localhost:3000/1')
    // 4.2 (100) 3m (10000)
    const res = http.get('https://central-game.ants.co.th/')
    // 5.6s (100) 24s (10000)
    // const response = http.post("http://localhost:3000/save1", { uid: Math.floor(Math.random() * 1000) + 1, score: Math.floor(Math.random() * 1000) + 1 });
    // 5.3s (100) 42s (10000)
    // const response = http.post("http://localhost:3000/save2", { uid: Math.floor(Math.random() * 1000) + 1, score: Math.floor(Math.random() * 1000) + 1, name: 'pawat', phone: '0645384912' });
    // new 2m (10000)
    //const response = http.post('http://localhost:3000/game/save', { uid: Math.floor(Math.random() * 1000) + 1, score: Math.floor(Math.random() * 1000) + 1, name: 'pawat', phone: '0645384912' })
}
