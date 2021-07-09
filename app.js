
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'vinh'

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    listRandom : [],
    currentIndex : 0,
    isPlaying : false, // check playing
    isRandom: false, // check random mode
    isRepeat: false, // check repeat mode
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY )) || {},
    songs: [
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg',
        },
        {
            name: 'Summertime ',
            singer: 'K-391',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg',
        },
        {
            name: 'Monody',
            singer: 'TheFatRat ',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg',
        },
        {
            name: 'Reality',
            singer: 'Lost Frequencies feat. Janieck Devy',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg',
        },
        {
            name: 'Ngày Khác Lạ',
            singer: 'Đen ',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg',
        },
        {
            name: 'Lemon Tree',
            singer: ' DJ DESA REMIX',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg',
        },
        {
            name: 'Sugar',
            singer: ' Maroon 5',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg',
        },
        {
            name: 'My Love',
            singer: 'Westlife ',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg',
        },
        {
            name: 'Attention',
            singer: 'Charlie Puth',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.jpg',
        },
        {
            name: 'Monsters ',
            singer: 'Katie Sky',
            path: './assets/music/song10.mp3',
            image: './assets/img/song10.jpg',
        }
    ], // list song
    setConfig: function(key, value) {
        this.config[key] = value; // tạo obejct có key và value
        localStorage.setItem(PLAYER_STORAGE_KEY , JSON.stringify(this.config)); // PLAYER_STORAGE_KEY is keyName - JSON.stringify(this.config) is keyValue
    },
    render: function() { // Render HTML
        const htmls = this.songs.map((song, index) =>{ // lọc qua hết các bài hát và render
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index ="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
          </div>
            `
        })
        playList.innerHTML = htmls.join(''); // Join to HTML
    },
    defineProperties: function() { 
        Object.defineProperty(this, 'currentSong',{ // define Property with name currentSong, have get(function) 
            get: function() {
                return this.songs[this.currentIndex]; // get current Song with index
            }
        });
    },
    handleEvent: function() { // handle Event
        
        const cdWidth = cd.offsetWidth;
        // Xử lý CD quay và dừng
        const cdThumAnimate = cdThumb.animate([ 
            { transform: 'rotate(360deg)' }, // rotate 360 degree
        ], {
            duration: 10000, // 10 seconds quay đc 1 vòng
            iterations: Infinity // lặp lại vô hạn
        })
        cdThumAnimate.pause();

        // Xử lí phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0;
            cd.style.opacity = newCdWidth/cdWidth;
        }

        // Xử lí khi click play
        playBtn.onclick = function(){
            if(app.isPlaying){
                audio.pause(); // audio.onpause
            }else{
                audio.play(); // => audio.onplay
            }
        }

        // Khi song được play
        audio.onplay = function() {
            app.isPlaying =true; // set isPlaying = true
            player.classList.add('playing'); // add class playing
            cdThumAnimate.play(); // quay đĩa CD
        }
        // Khi song bị pause
        audio.onpause = function() {
            app.isPlaying =false; // set isPlaying = false
            player.classList.remove('playing'); // remove class playing
            cdThumAnimate.pause(); // pause đĩa CD
        }
        
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() { // time of song
            if(audio.duration ){ // duration of song
                const progressPercent = Math.floor(audio.currentTime / audio.duration*100); // percent when play
                progress.value = progressPercent; // set value in class progress = precent progress to show
                // console.log(progressPercent);    
            } 
        }

        // Xử lí khi tua song
        progress.oninput = function(e){ // when have change in thẻ input
            const seekTime = audio.duration * e.target.value/100; 
            audio.currentTime = seekTime; 
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(app.isRandom){ // isRandom = true
                app.playRandomSong();// => play Random Song
            }else{
                app.nextSong(); // else play next song
            }
            audio.play(); // play music
            app.render(); // render lại giao diện
            app.scrollToActiveSong(); // Kéo screen tới active song
        }

        // khi prev song
        prevBtn.onclick = function() {
            if(app.isRandom){ // isRandom = true
                app.playRandomSong(); // => play Random Song
            }else{
                app.prevSong(); // else play prev song
            } 
            audio.play();// play music
            app.render(); // render lại giao diện
            app.scrollToActiveSong(); // Kéo tới active song
        }

        // Khi random song
        randomBtn.onclick = function(e) {
            app.isRandom = !app.isRandom; // đảo giá trị của isRandom
            app.setConfig('isRandom', app.isRandom); // set config
            randomBtn.classList.toggle('active', app.isRandom); // isRandom == true => add active , isRandom == false => dont add
        }

        // Xử lý next song khi audio ended
        audio.onended = function(){
            if(app.isRepeat){ // isRepeat == true
                audio.play(); // play again
            }else{
                nextBtn.click(); // else click nextBtn
            }
            
        }
        // Xử lý phát lại 1 song
        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat;// đảo giá trị của isRepeat
            app.setConfig('isRepeat', app.isRepeat); // set Config
            repeatBtn.classList.toggle('active', app.isRepeat);// isRepeat == true => add active , isRepeat == false => dont add
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)'); // have clas song and dont have class active
            if( songNode|| e.target.closest('.option')){ // have songNode or have class option

                // Xử lý clcik vào songs
                if(songNode){
                    //songNode.dataset.index trả về giá trị (String) data-index đã thêm trong HTML
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong(); // load song was clicked
                    audio.play(); // play song
                    app.render(); // render song
                }

                // Xử lí khi click vào option
                if(e.target.closest('.option')){}
            }
        }
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name; // sửa thành tên song
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`; // sửa backgroundImage thành ảnh của bài hát
        audio.src = this.currentSong.path; // thay đổi src của audio
        
    },
    scrollToActiveSong : function() { // cuộn màn hình đến vị trị bài hiện tại
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth', // option của scrollIntoView
                block: 'end',// option của scrollIntoView
            });
        },100)
    },
    loadConfig : function() {
        this.isRandom = this.config.isRandom; // load config cho isRandom
        this.isRepeat = this.config.isRepeat;// load config cho isRepeat
        this.currentIndex = this.config.currentIndex;
    },
    nextSong: function() {
        this.currentIndex++; // tăng index lên 1
        if(this.currentIndex >= this.songs.length ){ // nếu index vượt quá số bài hát
            this.currentIndex = 0; // index quay về 0
        }
        app.setConfig('currentIndex', app.currentIndex); // set current index in localStorage 
        this.loadCurrentSong(); // load bài hát
        
    },
    prevSong: function() {
        this.currentIndex--; // giảm index 1
        if(this.currentIndex < 0 ){ // nếu index bé hơn 0
            this.currentIndex = this.songs.length - 1; // index = index có giá trị lớn nhất
        }
        app.setConfig('currentIndex', app.currentIndex); // set current index in localStorage 
        this.loadCurrentSong(); // load bài hát
    },
    playRandomSong: function() {
        var songLength = this.songs.length;
        var newIndex;
        if(this.listRandom.length == songLength ){ // nếu độ mảng bằng số bài hát thì clear mảng
            this.listRandom.length = 0;
        }
        if(this.listRandom.length === 0){ // nếu mảng rỗng thì gán mảng bằng currentIndex
            this.listRandom = [this.currentIndex];
        }
        do {
            newIndex = Math.floor(Math.random() * songLength); // random từ 0 đến this.songs.length
        }while( this.currentIndex == newIndex || this.listRandom.includes(newIndex) ); // nếu newIndex = currentIndex và newIndex đãcó trong mảng thì lặp lại do
        
        this.currentIndex = newIndex; // gán newIndex == currentIndex
        this.listRandom.push(this.currentIndex); // đẩy currentIndex vào mảng
        
        console.log(this.listRandom);
        console.log(this.songs.length);
        
        app.setConfig('currentIndex', app.currentIndex); // set current index in localStorage 
        this.loadCurrentSong();// load bài hát
    },

    start: function(){
        
        // Gán cấu hình từ config vào object app
        this.loadConfig();
       
        // định nghĩa các thuộc tính cho object
        this.defineProperties();

        // lắng nghe các sự kiện
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong();

        //render playlist  
        this.render();

        // Hiển thị trạng thái ban đầu của btn repeat and random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    }
}
app.start();
