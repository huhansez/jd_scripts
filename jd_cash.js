/*
签到领现金，每日2毛～5毛
可互助，助力码每日不变，只变日期
活动入口：京东APP搜索领现金进入
更新时间：2021-06-07
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#签到领现金
2 0-23/4 * * * jd_cash.js, tag=签到领现金, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "2 0-23/4 * * *" script-path=jd_cash.js,tag=签到领现金

===============Surge=================
签到领现金 = type=cron,cronexp="2 0-23/4 * * *",wake-system=1,timeout=3600,script-path=jd_cash.js

============小火箭=========
签到领现金 = type=cron,script-path=jd_cash.js, cronexpr="2 0-23/4 * * *", timeout=3600, enable=true
 */
const $ = new Env('签到领现金');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
const randomCount = $.isNode() ? 5 : 5;
let cash_exchange = false;//是否消耗2元红包兑换200京豆，默认否
const inviteCodes = [
  `-rKPtHMVs0mV-GnUy3IR@9o-utX8csEWdJ9Va@eU9YaOvnYq9zoj_Xn3RCgA@eU9YauvmZ_1y82zUynJCgw@JB0-aeW0Yv4injM@Ih43a-uyYPwg92m6iw@eU9Ya7rgbvxyp2-AmXZGgA@eU9YaOrkZP0m9WrdyiBHgg@ZE9WGJTYF5VMojapmC8@WxplOb7n@eU9YaOjnZfwvoG7SyHFB3g@Ylo2bu-xZv4@9o-RuXkVZfkv@eU9Yauq0ZvUk92mGyncR1Q@eU9Yaeq0bvghoGrQn3QS0g@9bavu1Q6sUSuJsRhEtCiACBz@ZE9CCJb7AadfjAuWjSU@eU9Yab3kN_ov8jrUn3VC1A@eU9Ya-y1NPovomrcnXIb0Q@eU9Ya73jNPhz-GqBnntGhw@eU9Yab-yM_4h-WeDmXdG3g@eU9Yaevmb_0jo2_UmCYV1w@eU9YEpnkFZZakyiAsBBQ@eU9YDZPoErZTpT2JiCtb@eU9YaOW2ZP5woD_VnXUX1Q@eU9YaO22Zf1y-D_RzSIWgg@9q2ruXgrsnSbJOFOH_mlA7To@ZE9uBZrMA6dvqjOzjhI@eU9YO5L7OalfiQ6Mkztg@eU9YauSwYq8l-GzSn3NGgA@ZE93GIrhHI5huCqvqig@d142buW1YP0l-G_X@eU9YaLrkYfl09W3WniAQhQ@eU9YaO67Zfx1o2_RnnsTgg@eU9YaOrnb_onpz_WnXRB1w@eU9Ya-27Z68jpzrWz3ET1A@ZE9JJYzuBK9_oiipiApu@eU9YaLixZvsj82zcy3dA0w@eU9YariyNPVw8TjUnicQ0Q@eU9YaernM_x0ojzXyyJAhw@eU9YaeTgb60upzzVzyFAhQ@eU9YaO_jZfgipGfQmHsXgg@eU9YBLLmAbRspQeImTdS@9au7ulwAPw@JR81ZOS6Z_g7927Qy3ob@eU9Ya-63N6lw9WzWmSVChQ@eU9YaOW6Zq0kojzRnnUV0Q@eU9Yaui0N6gj9ziAzHdB0w@eU9YMrPEGaR6rQ2_oglA@ZE9mPYXUOKNujRmwiSk@Jhw3b-y0Zf47-WjdzXIV0vI@eU9Yaui0N6gj9ziAzHdB0w@eU9YauXhNf109ziAy3MX1Q@eU9Ya-61Nf4h9DrWnnpB1Q@eU9YaOq1Yq8vpWvXyyIa1w@9pSftHIyv061JeZlHN2PD2hA@eU9YDLTFMJV9qC6QrjlX@eU9Yauvhb68l8TuHnSYUgw@eU9YaOjgYq8i-W6Gw3RAhw@eU9Ya-SyMvQv9jyDzHtB1g@eU9Yaem3Yf0npWaGw3oT1g@eU9YaOSxZfsh9GqEniAW1w@eU9Yabi7ZPkjoDzTwiEQ3w@eU9YaemzY60iozqHmnpAgw@eU9YaL21NPxz8GbRyHoX0A@eU9Ya767Yfp0oDqAySBC0Q@eU9Ya766Nfgmp2uGnXoQ1A@V2Hv4Wdl3U4@eU9YauXnYv8i8zjWySFC1Q@ZkFtaek@eU9YFInpGJpwii-TqRdm@eU9YC6_6DLZjqTmviidV@eU9YaO22Mvt1pWyGz3IX1Q@eU9Ya-3gZvgg92_SmHERgg@9autulwosGCx@95SZtU4ksHid8WvVzw@eU9Yau6zMPol8DuGmSYQ0w@eU9YaLjkM_oj-G3dzCZBgw@eU9YaOywMqgl8TyGzSdH1A@9LS0ukoFsHun@eU9Yaum3Z_Qioz-BzHpAgg@eU9Ya76wY_0mo22EwyZG1A@IhM2bO2zY_Uh-Wm6iw@IhMwaem6Z_4u9G66iw@eU9YFoz2ErthtTakoQho@eU9Ya-zgZ_4l-DyAySBG3g@eU9Ya-61Yvwl-WyBw3MRgw@Khkwb--2Yv4hnjM@eU9YauXhNf109ziAy3MX1Q@eU9Yaeq3NPokpWqBzXRB1Q@Iho1a-W0Zf8h9QGI@eU9YaejnMvsl8T2AySAX3g@eU9YJY_SAqheqRy_qTlP@eU9YauXnM_gh8m_cmXAX1A@eU9Yaeq6Za8kpTzQzyEa1A@eU9YP5XYBap7ij2_gixy@f0IzbO66Y_gl8GY@Y199JO6yZv4m-GzV@eU9YO7joPKh9pTWBkCdL@eU9YabmwZKly9mnQznUQ1A@eU9YaOThYagiom_XwiAS0g@eU9Ya7m0Y_939WmDwnYS0Q@eU9Yarq0b_sk9zuDnnMS0Q@eU9YaL22Yq938GeEyCEQgg@eU9YauzkZPsn8WnSzHBAgA@95G9tGkyv2m7J-xEHtOg@eU9YaeSwZPx182zQwiES0w@eU9YaLq3MK4mp27WwnRAhQ@IhM0buqwb_on9mm6iw@IRgxbu-2bvQi9AGI@eU9YCJ_zGKN-jjCdiQFm@eU9Yaeq1bq4k9DvQyScbgg@-5yYu1Mvs0OOJPpCHOa9@9ZmmtUgbsnSgJ9Z0HvOSACZE8UzI4svf6mIxya1j@eU9YaLjnMvt1-DvWnnEU0w@eU9Yarm2ZPQmpWfdyyYU0w@9b6QuXI0s2GA@Ihg3buqxZP0k9G66iw@eU9Ya73nYfhz8mvWnSVH1A@eU9Ya-q6N_x08muDwnIT0A@eU9Ya7m7Zf13ojrQmiIVgA@9au7ulwAPw@eU9YCbX7MIRThjqmvjBs@dF5oKLPsMf0v-Wbczg@eU9Ya763M6ku9zqAzXMVhA@eU9Ya-mxbvkjoDvdziUQ1g@eU9YOqjOPotnhBqmqTtG@Yhozaem2Zf8l9Wk@eU9Ya7rgM_QmomuGmCZB1Q@Khkwb--2Yv4hnjM@eU9YaurgYfgg8GnUziEahQ@eU9Yab7mNK4v92uDmCVAhw@eU9YFrjpNYJcgwyIrytP@eU9YMYjlJ6pAkRmVvyBP@eU9Yauu3Y6l1pDjRnnMV1w@IR40aei2Y_ou9gGI@9ZK4ukM2@exk-auWxZg@eU9YaL-zNPkiojzSnyYb0w@eU9Yauy2NKkvp23XyXRBgg@eU9YJZfpJZpjiwaxmRRP@eU9Ya7nkNf4u-GfSyXAT3w@eU9YaeixMPkn8juHzXFC0A@eU9YN5vmBr1yiS-3tTFB@eU9Yaem6Yvgh9mjUyncT1Q@eU9YarjmYf118m_dnSAb0g@eU9YarmwNfkipzrVwyIT1A@eU9YEajTOLxxtBS0tSpg@eU9YabnjMK9w9j2DmiJA0g@eU9YaL66YPl38DzSwicQ3w@eU9Ya-XhZvki9D-BmCAb0w@eU9YKJnrNKRCjwawkylX@WU5oMrvbI6F_@eU9YFqzRMptggzG3nzdK@eU9YaLnhNfQl8D3Uz3YT1w@eU9Ya72zb_ok8DqHz3UXgg@eU9YabjkZfwl82mGmCEbhA@eU9Yaeu3MvR3p27Xn3UWhA@eU9YauSxZvsh8W3XnXBA1w@Jxg_aO-zZPUk7GjQw3IV3g@eU9Ya-7kMq0vpz2Ey3MX0A@eU9Ya-TjM64v9WbSnnVBhQ@QGdebe-xZ_oh-WjQzHQ@eU9Ya-jgYfRzp2yEnXBA1A@eU9YaLjnMqkmomzVnnZH1A@eU9YNJPKErtxowqGjxNn@eU9YP7btP4p8iy2ugRZ2@eU9YHpXGPL5RsTqIkydV@eU9YMYbkL699oByPiBJp@eU9YDrTRI4B1khWkvQ5y@eU9YO6z1L7xSrxK8uAZh@eU9YNYTrE71viweNnwBI@Ih42ZOS6bvog8mu6iw@V2liMLXnIKk@eU9Ya7iyY_Qn9TjWziVG0g@eU9YaO-zMq9yoz-DmSERhA@eU9YaOS0Yfov-GjUyXRB0Q@eU9YaLrmMK10oGvQwiUT3w@eU9YGYbyGJ1krjimnBJq@eU9YaujhYPskpzjXy3NC1w@ZE99FLfEJZ1DoAmUsxY@eU9Ya-66MKoh9mfRnXoa1A@eU9YauW0Zf4u9GmHw3QT1g@eU9YaernNK908mfTnnZA1g@eU9YaLmxb6gi-W3XnXAT1Q@ZE9qN6TnAKpApDeuixk@eU9YO6bnE65AkROfqAx1@eU9YHb3RPbpkjy6qqRJF@ZF5sPbXdZf0i@eU9YabiyNf4uomyBnyYQhw@9ruzuXIFvnG_qzo@ZE9uHprRI61FiSmsigY@eU9Yaeu6YPlz8WrXyCFB3g@eU9YLZ7UBot1mCuhqjNE@ZE9QP7PRIKlSoBWLjDU@eU9YCLf0GIZ-ijCwgjpw@eU9Yabq3Zvly82vRnyYb0A@eU9Yauq3YPwmpWzSwiIUhQ@eU9Yaeq2YvQg8TjcmHNBhw@eU9YC6XHOIJilwuqiwBq@eU9YaOnnZ_Ug8WqDmCZG0g@eU9YKpHnGoJToC2yvAhL@eU9Ya-i6bvV1pW7VzSYV0g@eU9YP67WGJZgtzi8qgZA@eU9Yaei6Ya4g-GndmSUV0A@f0ppKKm1YQ@eU9YEZTgHqNTmQacgjBg@eU9YH7rIIKR4shKDsDZb@eU9YOp7kMaJ4mSaXjjZE@dFFrPbL2Iw@eU9YNZLIHq16gBOTrTdP@Ih43buWyYPkj8Go`
]
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let allMessage = '';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  await requireConfig()
  await getAuthorShareCode();
  await getAuthorShareCode2();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdCash()
    }
  }
  if (allMessage) {
    if ($.isNode() && (process.env.CASH_NOTIFY_CONTROL ? process.env.CASH_NOTIFY_CONTROL === 'false' : !!1)) await notify.sendNotify($.name, allMessage);
    $.msg($.name, '', allMessage);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdCash() {
  $.signMoney = 0;
  await index()
  await shareCodesFormat()
  await helpFriends()
  await getReward()
  await getReward('2');
  $.exchangeBeanNum = 0;
  cash_exchange = $.isNode() ? (process.env.CASH_EXCHANGE ? process.env.CASH_EXCHANGE : `${cash_exchange}`) : ($.getdata('cash_exchange') ? $.getdata('cash_exchange') : `${cash_exchange}`);
  if (cash_exchange === 'true') {
    if(Number($.signMoney) >= 2){
      console.log(`\n\n开始花费2元红包兑换200京豆，一周可换五次`)
      for (let item of ["-1", "0", "1", "2", "3"]) {
        $.canLoop = true;
        if ($.canLoop) {
          for (let i = 0; i < 5; i++) {
            await exchange2(item);//兑换200京豆(2元红包换200京豆，一周5次。)
          }
          if (!$.canLoop) {
            console.log(`已找到符合的兑换条件，跳出\n`);
            break
          }
        }
      }
      if ($.exchangeBeanNum) {
        message += `兑换京豆成功，获得${$.exchangeBeanNum * 100}京豆\n`;
      }
    }else{
      console.log(`\n\n现金不够2元，不进行兑换200京豆，`)
    }
  }
  await index(true)
  // await showMsg()
}
function index(info=false) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home",), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              if(info){
                if (message) {
                  message += `当前现金：${data.data.result.signMoney}元`;
                  allMessage += `京东账号${$.index}${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
                }
                console.log(`\n\n当前现金：${data.data.result.signMoney}元`);
                return
              }
              $.signMoney = data.data.result.signMoney;
              // console.log(`您的助力码为${data.data.result.inviteCode}`)
              console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.data.result.inviteCode}\n`);
              let helpInfo = {
                'inviteCode': data.data.result.inviteCode,
                'shareDate': data.data.result.shareDate
              }
              $.shareDate = data.data.result.shareDate;
              // $.log(`shareDate: ${$.shareDate}`)
              // console.log(helpInfo)
              for(let task of data.data.result.taskInfos){
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    console.log(`去帮助好友${code['inviteCode']}`)
    await helpFriend(code)
    if(!$.canHelp) break
    await $.wait(1000)
  }
  // if (helpAuthor && $.authorCode) {
  //   for(let helpInfo of $.authorCode){
  //     console.log(`去帮助好友${helpInfo['inviteCode']}`)
  //     await helpFriend(helpInfo)
  //     if(!$.canHelp) break
  //     await $.wait(1000)
  //   }
  // }
}
function helpFriend(helpInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_assist", {...helpInfo,"source":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0 && data.data.bizCode === 0){
              console.log(`助力成功，获得${data.data.result.cashStr}`)
              // console.log(data.data.result.taskInfos)
            } else if (data.data.bizCode===207){
              console.log(data.data.bizMsg)
              $.canHelp = false
            } else{
              console.log(data.data.bizMsg)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0){
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(data)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function getReward(source = 1) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_reward",{"source": Number(source),"rewardNode":""}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data.bizCode === 0) {
              console.log(`领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}】`)
              message += `领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}元】\n`;
              // console.log(data.data.result.taskInfos)
            } else {
              // console.log(`领奖失败，${data.data.bizMsg}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function exchange2(node) {
  let body = '';
  const data = {node,"configVersion":"1.0"}
  if (data['node'] === '-1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595890027&sign=92a8abba7b6846f274ac9803aa5a283d&sv=102`;
  } else if (data['node'] === '0') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597882090&sign=e00bd6c3af2a53820825b94f7a648551&sv=100`;
  } else if (data['node'] === '1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595655007&sign=2e72bbd21e5f5775fe920eac129f89a2&sv=111`;
  } else if (data['node'] === '2') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597924095&sign=c04c70370ff68d71890de08a18cac981&sv=112`;
  } else if (data['node'] === '3') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597953001&sign=4c36b3d816d4f0646b5c34e7596502f8&sv=122`;
  }
  return new Promise((resolve) => {
    const options = {
      url: `${JD_API_HOST}?functionId=cash_exchangeBeans&t=${Date.now()}&${body}`,
      body: `body=${escape(JSON.stringify(data))}`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === 0) {
              if (data.data.bizCode === 0) {
                console.log(`花费${data.data.result.needMoney}元红包兑换成功！获得${data.data.result.beanName}\n`)
                $.exchangeBeanNum += parseInt(data.data.result.needMoney);
                $.canLoop = false;
              } else {
                console.log('花费2元红包兑换200京豆失败：' + data.data.bizMsg)
                if (data.data.bizCode === 504) $.canLoop = true;
                if (data.data.bizCode === 120) $.canLoop = false;
              }
            } else {
              console.log(`兑换京豆失败：${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: `https://code.chiang.fun/api/v1/jd/jdcash/read/${randomCount}/`, 'timeout': 10000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
      let authorCode = deepCopy($.authorCode)
      $.newShareCodes = [...(authorCode.map((item, index) => authorCode[index] = item['inviteCode'])), ...$.newShareCodes];
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    $.newShareCodes.map((item, index) => $.newShareCodes[index] = { "inviteCode": item, "shareDate": $.shareDate })
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    let shareCodes = [];
    if ($.isNode()) {
      if (process.env.JD_CASH_SHARECODES) {
        if (process.env.JD_CASH_SHARECODES.indexOf('\n') > -1) {
          shareCodes = process.env.JD_CASH_SHARECODES.split('\n');
        } else {
          shareCodes = process.env.JD_CASH_SHARECODES.split('&');
        }
      }
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_cash_invite')) $.shareCodesArr = $.getdata('jd_cash_invite').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的京喜财富岛邀请码:${$.getdata('jd_cash_invite')}\n`);
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function deepCopy(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepCopy(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

function getAuthorShareCode(url = "http://cdn.annnibb.me/jd_cash.json") {
  return new Promise(resolve => {
    $.get({url, headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }, timeout: 200000,}, async (err, resp, data) => {
      $.authorCode = [];
      try {
        if (err) {
        } else {
          $.authorCode = JSON.parse(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getAuthorShareCode2(url = "https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_updateCash.json") {
  return new Promise(resolve => {
    $.get({url, headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }, timeout: 200000,}, async (err, resp, data) => {
      $.authorCode2 = [];
      try {
        if (err) {
        } else {
          $.authorCode2 = JSON.parse(data)
          if ($.authorCode2 && $.authorCode2.length) {
            $.authorCode.push(...$.authorCode2);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
