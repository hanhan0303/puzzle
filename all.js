const closeGameBtn = document.getElementById('closeBtn');
const gameWrapOverlay = document.querySelector('.gameWrap-alert-overlay');
const loading = document.querySelector('.loading');

const loginGoogle = document.querySelector('.login-google');
const loginBtn = document.getElementById('loginBtn');

const startGame = document.querySelector('.startGame');
const playerNameInput = document.getElementById('player-name-input');
const nullValueMessage = document.querySelector('.input-message');
const alreadyTakenMessage = document.getElementById('update-result');
const startGameBtn = document.getElementById('update-player-name-btn');

const puzzleGame = document.querySelector('.puzzleGame');
const puzzleDragzoneLeft = document.getElementById('puzzleGroup-dragzone-left');
const puzzleDragzoneRight = document.getElementById(
  'puzzleGroup-dragzone-right',
);
let puzzleGroup = document.querySelector('.puzzleGroup');

const finishGame = document.querySelector('.finishGame');
const restartBtn = document.getElementById('restartBtn');
const prizeInfoShowBtn = document.getElementById('check-prize-btn');

const prizeInfo = document.querySelector('.prize-info');
const howToGetBtn = document.getElementById('howToGet');
const howToGet = document.getElementById('howToGet-content');
const fbEventBtn = document.getElementById('fbEvent');
const fbEvent = document.getElementById('fb-content');
const top10Message = document.querySelector('.top10-ranking-message');
const winGameInfoTable = document.querySelector('.winGame-info-table');

let startAt = null;
let userName = '';

//images Arr
const domain = 'https://lodigamer.com/';
const imgDomain = 'lodi';
const imgAlt = 'lodibet';
const puzzleImgArr = [];


for (let i = 1; i <= 9; i++) {
  let url = '';
  // url += `${domain}wp-content/uploads/2024/11/${imgDomain}-puzzle${i}.webp`;
  url += `/images/lodi-puzzle/${imgDomain}-puzzle${i}.webp`;
  let imgInfo = {
    imgUrl: url,
    alt: imgAlt,
    draggable: true,
    checkNum: i,
  };
  puzzleImgArr.push(imgInfo);
}

/*-----*/
//打API
// function callAdminAjax(options) {
// 	const {
// 		action,
// 		onSuccess = () => {},
// 		onError = () => {},
// 		data = {},
// 	} = options;

// 	const ajaxData = Object.assign({}, data, { action });

// 	return jQuery
// 		.ajax({
// 			method: 'POST',
// 			url: '/wp-admin/admin-ajax.php',
// 			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
// 			data: ajaxData,
// 		})
// 		.done(onSuccess)
// 		.fail(onError);
// };
/*-----------*/
// function checkLoginStatus() {
// 	this.callAdminAjax({
// 		action: 'check_user_logged_in',
// 		data: {
// 			player_name: this.userName,
// 		},
// 		onSuccess: (data) => {
// 			const isLoggedIn = data.data.logged_in;
// 			this.userName = data.data.player_name;
// 			console.log('[Memory] isLoggedIn', isLoggedIn);
// 			console.log('logged_data-username', this.userName);
// 			console.log('logged_data-player', data.data.player_name);
// 			this.loginAlertLoading.style.display = 'none';

// 			if (isLoggedIn) {
// 				this.bermonthAlert.style.display = 'none';
// 				this.checkHaveUsername();
// 			} else {
// 				this.loginAlertGoogle.style.display = 'flex';
// 			}
// 		},
// 	});
// }

function createPuzzle(item, dragzone) {
  const container = document.createElement('div');
  container.classList.add('puzzle-dragzone');

  const img = document.createElement('img');
  img.classList.add('puzzle');
  img.src = item.imgUrl;
  img.alt = item.alt;
  img.draggable = item.draggable;
  img.dataset.checkNum = item.checkNum;

  container.appendChild(img);
  dragzone.appendChild(container);
}
function createPuzzleBox() {
  for (let i = 1; i <= 9; i++) {
    let PuzzleDiv = document.createElement('div');
    PuzzleDiv.className = 'puzzleBox';
    PuzzleDiv.dataset.num = i;
    puzzleGroup.appendChild(PuzzleDiv);
  }
}
function puzzleGameStart() {
  	//0.restart清除拼圖
	puzzleDragzoneRight.innerHTML = "";
	puzzleDragzoneLeft.innerHTML = "";
	puzzleGroup.innerHTML = "";
  // 1. 隨機打亂陣列順序
  puzzleImgArr.sort(() => Math.random() - 0.5);

  //將前 5 個物件添加到 puzzleDragzoneLeft
  puzzleImgArr.slice(0, 5).forEach((item) => {
    createPuzzle(item, puzzleDragzoneLeft);
  });
  // 4. 將後 4 個物件添加到 puzzleDragzoneRight
  puzzleImgArr.slice(5).forEach((item) => {
    createPuzzle(item, puzzleDragzoneRight);
  });
  // 5. 添加一個空的 .puzzle-dragzone 到 puzzleDragzoneRight
  const emptyContainer = document.createElement('div');
  emptyContainer.classList.add('puzzle-dragzone');
  puzzleDragzoneRight.appendChild(emptyContainer);
  createPuzzleBox();
  bindEvents();

  startAt = Date.now();
}

function bindEvents() {
  let puzzle = document.querySelectorAll('.puzzle');
  puzzle.forEach((item) => {
    item.addEventListener('dragstart', dragStart);
  });

  let puzzleBox = document.querySelectorAll('.puzzleBox');
  puzzleBox.forEach((item) => {
    item.addEventListener('dragover', dragOver);
    item.addEventListener('drop', dragDrop);
    item.addEventListener('dragleave', dragLeave);
  });
  let puzzleDragzone = document.querySelectorAll('.puzzle-dragzone');
  puzzleDragzone.forEach((item) => {
    item.addEventListener('dragover', dragOver);
    item.addEventListener('drop', dragDrop);
    item.addEventListener('dragleave', dragLeave);
  });
}

let draggingPuzzle = null;
const dragStart = (e) => {
  draggingPuzzle = e.target;
};
const dragOver = (e) => {
  e.preventDefault();
  // 拼圖區
  if (e.target.className == 'puzzleBox') {
    e.toElement.classList.add('hover');
  }
  // 放置區
  if(e.target.className === 'puzzle-dragzone') {
    e.toElement.classList.add('hover');
  }
};
const dragDrop = (e) => {
  e.preventDefault();
  // 清除 hover 樣式
  e.target.classList.remove('hover');

  // 確認目標是 .puzzleBox 且其中沒有其他拼圖
  let targetBox = e.target;

  if(!targetBox) {
    return false;
  }

  // 如果對應位置已經有 puzzle，則交換
  if ((targetBox.classList.contains('puzzle'))) {
    // 拿到 draggingPuzzle 的原始位置的 parent
    // 拿到 targetBox 的 puzzle 的 parent
    const sourceOfDraggingPuzzle = draggingPuzzle.parentNode;
    const sourceOfTargetBox = targetBox.parentNode;

    sourceOfDraggingPuzzle.appendChild(targetBox)
    sourceOfTargetBox.appendChild(draggingPuzzle)
  }

  // 如果對應位置無 puzzle，則直接放置
  if (targetBox.classList.contains('puzzleBox') || targetBox.classList.contains('puzzle-dragzone')) {
    // 放置
    targetBox.appendChild(draggingPuzzle);
  }

  checkAllDom();
};

const dragLeave = (e) => {
  e.toElement.classList.remove('hover');
};

// 更新 checkAllDom 函數來判斷是否所有 .puzzleBox 的 data-num 和內部拼圖的 data-checkNum 一致
function checkAllDom(forceWin = false) {
  let PuzzleBox = document.querySelectorAll('.puzzleBox');
  let isWin = true; // 假設為獲勝狀態

  // 檢查每個 .puzzleBox 是否正確放置
  PuzzleBox.forEach((box) => {
    let puzzle = box.querySelector('.puzzle');
    if (puzzle) {
      // 若 box 的 data-num 不等於拼圖的 data-checkNum，則不算獲勝
      if (box.dataset.num !== puzzle.dataset.checkNum) {
        isWin = false;
      }
    } else {
      // 如果有任何 .puzzleBox 沒有拼圖，則不算獲勝
      isWin = false;
    }
  });

  // 若全部正確，則顯示勝利畫面
  if (isWin || forceWin) {
    const totalSeconds = (Date.now() - startAt) / 1000;
    console.log('totalSeconds', totalSeconds);

    // API
    callAdminAjax({
      action: 'save_game_score',
      data: {
        score: totalSeconds
      },
      onSuccess: () => {
        showFinishGamePage();
      },
      onError: () => {}
    });
  }
}

function showFinishGamePage() {
  // API
  callAdminAjax({
    action: '拿到成績的 action',
    data: {
      // 帶入後端指定的 Data
      // gameID: '...'
    },
    onSuccess: ({ data }) => {
      // 清掉舊資料
      $(winGameInfoTable).children('.winGame-info-table-tbody').remove();
      // 建立 Table
      $(winGameInfoTable).append(data.map(item => $(`
          <div class="winGame-info-table-tbody">
            <div class="col-date">week ${item.week}<span>(${item.startDate}~${item.endDate})</span></div>
            <div class="col-time winGame-info-winTime" id="week1">
              ${item.bestScore}
            </div>
            <div class="col-code-title">Promocode</div>
            <div class="col-code" id="week1-promocode">
              ${item.promotionCode}
            </div>
          </div>
      `)))

      puzzleGame.classList.add('hidden');
      setTimeout(function () {
        puzzleGame.style.display = 'none';
        finishGame.classList.add('show');
        finishGame.style.display = 'block';
      }, 1000);
    },
    onError: () => {}
  });
}

function callAdminAjax(options) {
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG
  // 記得刪除或改掉
  if(options.action === '拿到成績的 action') {
    return options.onSuccess({
      data: [
        {
          week: 1,
          startDate: '11/8',
          endDate: '11/14',
          bestScore: '00:40',
          promotionCode: 'BERMONTHSLOVE'
        },
        {
          week: 2,
          startDate: '11/15',
          endDate: '11/21',
          bestScore: '',
          promotionCode: ''
        },
        {
          week: 3,
          startDate: '11/22',
          endDate: '11/28',
          bestScore: '',
          promotionCode: ''
        }
      ]
    })
  }

  if(options.action === 'save_game_score') {
    return options.onSuccess()
  }
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG
  // DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG-DEBUG

  const {
    action,
    onSuccess = () => {},
    onError = () => {},
    data = {}
  } = options;

  const ajaxData = Object.assign(data, { action });

  return $.ajax({
    method: 'POST',
    // 因為後端沒提供 API Url，所以用以下方式
    url: "/wp-admin/admin-ajax.php",
    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
    data: ajaxData,
  })
    .done(onSuccess)
    .fail(onError);
}

// DEBUG!!!!
window.win = () => checkAllDom(true);

startGameBtn.addEventListener('click', function() {
  puzzleGameStart();
  startGame.style.display = 'none';
  puzzleGame.style.display = 'block';
});

restartBtn.addEventListener('click', function() {
  puzzleGameStart();
  finishGame.style.display = 'none';
  puzzleGame.classList.remove('hidden');
  puzzleGame.style.display = 'block';
});
