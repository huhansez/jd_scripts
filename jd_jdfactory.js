/*
Last Modified time: 2020-12-26 22:58:02
东东工厂，不是京喜工厂
活动入口：京东APP首页-数码电器-东东工厂
免费产生的电量(10秒1个电量，500个电量满，5000秒到上限不生产，算起来是84分钟达到上限)
故建议1小时运行一次
开会员任务和去京东首页点击“数码电器任务目前未做
不会每次运行脚本都投入电力
只有当心仪的商品存在，并且收集起来的电量满足当前商品所需电力，才投入
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#东东工厂
10 * * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js, tag=东东工厂, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_factory.png, enabled=true

================Loon==============
[Script]
cron "10 * * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js,tag=东东工厂

===============Surge=================
东东工厂 = type=cron,cronexp="10 * * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js

============小火箭=========
东东工厂 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js, cronexpr="10 * * * *", timeout=3600, enable=true
 */
const $ = new Env('东东工厂');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (process.env.JDFACTORY_FORBID_ACCOUNT) process.env.JDFACTORY_FORBID_ACCOUNT.split('&').map((item, index) => Number(item) === 0 ? cookiesArr = [] : cookiesArr.splice(Number(item) - 1 - index, 1))
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let wantProduct = ``;//心仪商品名称
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const inviteCodes = ['T020Z1TLmIG-IOFkKR31lPYICjVWnYaS5kRrbA','T016a2nqmY23I-1s9qF7CjVWnYaS5kRrbA','T0225KkcRBlM8QeCc0v2wPBbIgCjVWnYaS5kRrbA','T0225KkcRhlN9FWDIhj1lfZbIQCjVWnYaS5kRrbA','T015uft6RRcf8VbTT0cCjVWnYaS5kRrbA','T018v_hzRxkZ81TRJh2b1ACjVWnYaS5kRrbA','T0225KkcR0hL_VSDdhuhxvJfIgCjVWnYaS5kRrbA','','','T008xvwhFUxMCjVWnYaS5kRrbA','T0225KkcRBpM9lTecRrzl_VYfACjVWnYaS5kRrbA','T011_7xyQh0a9VYCjVWnYaS5kRrbA','T012a2nVlYu-9lHeCjVWnYaS5kRrbA','T0225KkcRhgf9V3VJh2nlfMIdwCjVWnYaS5kRrbA','T0225KkcRRgf_VDQcR7xwPALcACjVWnYaS5kRrbA','T024aFDrl6aRIuxf97BATVS7ok2VCjVWnYaS5kRrbA','T019-akGJGRQkg-uXX-30qECjVWnYaS5kRrbA','T0225KkcRU9PpFLeI071wPFbdgCjVWnYaS5kRrbA','T0225KkcRx4ep1Lecx79wvYCcwCjVWnYaS5kRrbA','T0225KkcR09Ip1CCKR6gwf9fJQCjVWnYaS5kRrbA','T0225KkcRU0ZoFbQKBOixvNffACjVWnYaS5kRrbA','T0225KkcRRlN_FXSchv1x6IMdQCjVWnYaS5kRrbA','T0205KkcPmtPhj6rQlyh75RJCjVWnYaS5kRrbA','T0205KkcIWFDgR6idEmo169CCjVWnYaS5kRrbA','T0225KkcRBcd91aBcUv0wvEOdwCjVWnYaS5kRrbA','T0225KkcRB8d9lWDKUvwkqYPIACjVWnYaS5kRrbA','T024a0vvlYqAIdxq9ZVvQH28oXmwCjVWnYaS5kRrbA','T019-akqKWhnkA-ee0eS0ZYCjVWnYaS5kRrbA','T0205KkcF2BQqgGuWHqtzL95CjVWnYaS5kRrbA','T0225KkcRhYb8QfUKRjzwPdfIgCjVWnYaS5kRrbA','T019-akzNHhKjyaQaV6O9awCjVWnYaS5kRrbA','T0166rhyQhce81XUKRv2CjVWnYaS5kRrbA','T0225KkcREhP8lGFJBn3waQJJwCjVWnYaS5kRrbA','T0225KkcRBwQ9lSEchvwwf8KIACjVWnYaS5kRrbA','T0225KkcRBhM_FLWdkv3wvBYdQCjVWnYaS5kRrbA','T0225KkcRx8Q9AfSdk73kPUKdgCjVWnYaS5kRrbA','T020-akNCX5FlweOc1yI1453CjVWnYaS5kRrbA','T0225KkcREoa9VPSIhj9lPNZcQCjVWnYaS5kRrbA','T0225KkcRkoZp12BIEz1waMJcwCjVWnYaS5kRrbA','T0225KkcRRhMoFSFc0j2lKZZJQCjVWnYaS5kRrbA','T0225KkcRRZL_AXfdkj0kKVZJwCjVWnYaS5kRrbA','T0225KkcRB1I9lDTdRPxx_8OIACjVWnYaS5kRrbA','T0205KkcKEBNkhyddHOpxrNLCjVWnYaS5kRrbA','T010aE3_lq6rrACjVWnYaS5kRrbA','T020uPlxSBYR9FDKJhrxlP4CCjVWnYaS5kRrbA','T0225KkcRxwcpAGBJBj3xqFbJwCjVWnYaS5kRrbA','T0225KkcRBcR9QXVc0jwwfEMcwCjVWnYaS5kRrbA','T0225KkcRhofpADSJkyhk_NYcQCjVWnYaS5kRrbA','','T019-akiEXd_qwufXG2R1q0CjVWnYaS5kRrbA','T023u_pzQx4f9lbKKBz8kvYMcH0CjVWnYaS5kRrbA','T0225KkcRhofpADSJkyhk_NYcQCjVWnYaS5kRrbA','T0225KkcRhdKplWFJkyhlPcOdwCjVWnYaS5kRrbA','T0225KkcRxweplbQJU73wf5YdwCjVWnYaS5kRrbA','T0225KkcRBge8QfedB_2lKYDdQCjVWnYaS5kRrbA','T024a3LbmICZLOZE9JJEQ1mWrWctCjVWnYaS5kRrbA','T0205KkcIEZuoz2MeVqx8b1OCjVWnYaS5kRrbA','T0225KkcRhlK_AfUIE-mwqINIQCjVWnYaS5kRrbA','T0225KkcRBpL8QfTKBqnnPBZJQCjVWnYaS5kRrbA','T0225KkcRxYZoVzeJ0iik_9YdACjVWnYaS5kRrbA','T0225KkcRRsc8lXWdBKnnP4KdACjVWnYaS5kRrbA','T0225KkcRBYa9lPQJR6lwaQPdQCjVWnYaS5kRrbA','T0225KkcRUoQ91HScUjynaUJfQCjVWnYaS5kRrbA','T0225KkcRRsY8AXTck6mxf5ZIQCjVWnYaS5kRrbA','T0225KkcRE8ep1SCIRLwl_4OcgCjVWnYaS5kRrbA','T0225KkcR0wQ8lKFcU6hlqRbcwCjVWnYaS5kRrbA','T0225KkcR0wRplDXdh-nwv4JdgCjVWnYaS5kRrbA','T011yoerzZXOTuYCjVWnYaS5kRrbA','T0225KkcRhdM8VfTIkz3lqVbdwCjVWnYaS5kRrbA','','T007-6cpRRsCjVWnYaS5kRrbA','T0205KkcOHtCizKBW1uy9pN_CjVWnYaS5kRrbA','T0205KkcJ11Rnx6SeE2O1aNMCjVWnYaS5kRrbA','T0225KkcRB8doVOEdBinkPYOdwCjVWnYaS5kRrbA','T0225KkcRx9L9VDRJhvzx_UIIACjVWnYaS5kRrbA','T012aE3plq6DI8hACjVWnYaS5kRrbA','T018anLdmbyPI9BsIB_0kACjVWnYaS5kRrbA','T0225KkcRhwYo1LUIU-nxqIJcQCjVWnYaS5kRrbA','T0225KkcREpPoFLSKRn8k6JYIQCjVWnYaS5kRrbA','T0225KkcRB4boQDUIEinkqNedgCjVWnYaS5kRrbA','T012aVLwlriuI9NWCjVWnYaS5kRrbA','T0225KkcRhsc9FzTckugk_5ZIACjVWnYaS5kRrbA','T018v_57Rx8Q81zfKB2b1ACjVWnYaS5kRrbA','T0225KkcR0wb8FXXchmlnKJfdgCjVWnYaS5kRrbA','T018v_VyQB8Y8F3QKB2b1ACjVWnYaS5kRrbA','T018v_V0RRsR9FbfJRqb1ACjVWnYaS5kRrbA','T0205KkcOn5dgROQZEKF_oxxCjVWnYaS5kRrbA','T0225KkcRx5L9FbUKUihlqRffACjVWnYaS5kRrbA','T0225KkcRxwe8VTUKBignPcIIQCjVWnYaS5kRrbA','T015t_90Qx0d8VbQT0cCjVWnYaS5kRrbA','T0225KkcRhdKplWFJkyhlPcOdwCjVWnYaS5kRrbA','T0225KkcRRgcp1LVdB6gkvBYdwCjVWnYaS5kRrbA','T016v_xxRxcf9lfQJHWpCjVWnYaS5kRrbA','T0225KkcRRpMoVPUIEmhlqQOfACjVWnYaS5kRrbA','T0205KkcCX15kQCveGie9r1WCjVWnYaS5kRrbA','T0225KkcRhdMoFDQIxv9xvQOdgCjVWnYaS5kRrbA','T0225KkcRRgR9gfVdEjxkKUDdgCjVWnYaS5kRrbA','','T0154qR3QBwR8FDUIRICjVWnYaS5kRrbA','T016_rk5CBwZ9VbXKRj0CjVWnYaS5kRrbA','T0205KkcF0pDrwCMdEGgz6NSCjVWnYaS5kRrbA','T0225KkcRUsb9wGDJx3xkfEJdgCjVWnYaS5kRrbA','T0225KkcRBZK8gDTcxv2naQLcACjVWnYaS5kRrbA','T0225KkcR0sf8FeGJB2infILcwCjVWnYaS5kRrbA','T0225KkcRkgf_FPVJk-iwfcLcwCjVWnYaS5kRrbA','T0225KkcRE8d8QeGIROll6UJIACjVWnYaS5kRrbA','T0205KkcB2lOtAOFR26T7qRCCjVWnYaS5kRrbA','T0225KkcRh5P91PWIB3zk_RZIgCjVWnYaS5kRrbA','T020anf5mJuZLMFK9phlQVe5CjVWnYaS5kRrbA','T0225KkcRRYb91SEIhjxnaULcQCjVWnYaS5kRrbA','','T0225KkcREgcowbXdhr3nfBZJwCjVWnYaS5kRrbA','T018v_VwQhgb_FLWJx2b1ACjVWnYaS5kRrbA','T016vP51Qh0d_VzTJXWpCjVWnYaS5kRrbA','T0205KkcJG1YiwuPX0S81oV_CjVWnYaS5kRrbA','T0225KkcRRge_QbVJU_xlqMCIACjVWnYaS5kRrbA','T020Znrcl6GEIOt_9Y5jQ2KkCjVWnYaS5kRrbA','T040aH_imbqwIdxR9qJVQXeLoh0btM9CuMvMwDc1_IgyCjVWnYaS5kRrbA','T0225KkcREpMoVOEKU_3wfUNcQCjVWnYaS5kRrbA','T0225KkcRksd91zXdBP8lKINcQCjVWnYaS5kRrbA','T012aFjUlYCfIMlxCjVWnYaS5kRrbA','T018v_5zQhga91XVJRqb1ACjVWnYaS5kRrbA','','T0225KkcR09M8lCCIx_3wqFedgCjVWnYaS5kRrbA','T0225KkcRxgRpFSFIx-infYKcgCjVWnYaS5kRrbA','T0225KkcR0sQ9lWGc07xxaYMIgCjVWnYaS5kRrbA','T018v_57Rx8Q81zfKB2b1ACjVWnYaS5kRrbA','T010aE3_lq6rrACjVWnYaS5kRrbA','T0205KkcH2Z_nAGDQWKq4rJMCjVWnYaS5kRrbA','T0205KkcJUdQoyyiV06H4bR1CjVWnYaS5kRrbA','T0186bgsBEFHolXeKBL9kQCjVWnYaS5kRrbA','T0225KkcR0wcoAHfJk6hkvcMJgCjVWnYaS5kRrbA','T0225KkcRxsa_VHScU_8kaEJdACjVWnYaS5kRrbA','T0205KkcFlplrSOWVW6H9r9fCjVWnYaS5kRrbA','T015__x3RRsd9lfUJB0CjVWnYaS5kRrbA','T0225KkcR0hLoFzXcx-nx6JYdwCjVWnYaS5kRrbA','T015t_90Qx0d8VbQT0cCjVWnYaS5kRrbA','T0225KkcRhhL8lDRIR31kaUDJwCjVWnYaS5kRrbA','T0225KkcRUxNpwbeJh-ix6FZJQCjVWnYaS5kRrbA','T0205KkcOkpCpiqtUnip8K9WCjVWnYaS5kRrbA','T0205KkcHXpOtAKxQG204KRWCjVWnYaS5kRrbA','T0225KkcRhkc8AGEdUzwwfcMdQCjVWnYaS5kRrbA','T016vPhwRRod8FLfJ3WpCjVWnYaS5kRrbA','T008aHT8lrGdCjVWnYaS5kRrbA','T0105v96Rhca9QCjVWnYaS5kRrbA','T0225KkcRE0Yp1HTc0jzwKICcQCjVWnYaS5kRrbA','T0225KkcRh4dpwHedhn2lvBYIACjVWnYaS5kRrbA','T0205KkcCWVCtjKSWnKQxpBWCjVWnYaS5kRrbA','T0225KkcR0tPplbfKRPzlvQKfQCjVWnYaS5kRrbA','T0225KkcRRoao1HWI0-mkvVbcgCjVWnYaS5kRrbA','','T0225KkcRRsR8VDQJxz1lfMKdwCjVWnYaS5kRrbA','T0225KkcRkpN8lWEIxv8wqQCcACjVWnYaS5kRrbA','T0225KkcRksbplHTdk70nKYKdgCjVWnYaS5kRrbA','T0205KkcPVp4qxSAZWCV6q55CjVWnYaS5kRrbA','T0225KkcRUtIoweBJ0mixaZZcACjVWnYaS5kRrbA','T0225KkcREwR81GGIUjznaMJfQCjVWnYaS5kRrbA','T0225KkcRxdK9VHTJUugx6QCcQCjVWnYaS5kRrbA','T0205KkcBGtApwyzXnKRzK1OCjVWnYaS5kRrbA','T012xKgsHklwsAmOCjVWnYaS5kRrbA','T0205KkcOl56oTORUkWWwLNTCjVWnYaS5kRrbA','T0225KkcREtKplzUIUn1kPIKdQCjVWnYaS5kRrbA','T0225KkcR08Y_FLVIU6mkPEOIACjVWnYaS5kRrbA','T0225KkcRUpP9lTUIh2nx6UCJgCjVWnYaS5kRrbA','T0225KkcRRkcoVyGdhr2wPEPJgCjVWnYaS5kRrbA','T0225KkcRhYa9VPQIBn2wvRZdQCjVWnYaS5kRrbA','T022uv57RB0Y913VPRzxnPYMfACjVWnYaS5kRrbA','T0225KkcRxxPoQXedkmllPcOcgCjVWnYaS5kRrbA','T0225KkcRxZIoAbeJBLzwfFYJwCjVWnYaS5kRrbA','T0193YEaQR0a9FLQKBzxk_ACjVWnYaS5kRrbA','','T0225KkcRxgR_QHTIh78wPAPcQCjVWnYaS5kRrbA','T0225KkcREpMoQHXcxj0wfJedgCjVWnYaS5kRrbA','','T0205KkcE0RGrCKNWlmP3pJvCjVWnYaS5kRrbA','T0205KkcMmdtrxagYE6pzKNMCjVWnYaS5kRrbA','T0205KkcHXRPvAeMcWiu15ZwCjVWnYaS5kRrbA','T0205KkcIkZ6sCiEQ2GF4oprCjVWnYaS5kRrbA','T0205KkcF15evBSjfmad54J4CjVWnYaS5kRrbA','T0205KkcGXZAgBWeWnOswIRRCjVWnYaS5kRrbA','','T018v_hySBYR_VLRIx-b1ACjVWnYaS5kRrbA','T011yo8mHEdMswECjVWnYaS5kRrbA','T0225KkcR0oZ8FzWJEz3kaFfcACjVWnYaS5kRrbA','T0225KkcRB0YoQeDckuixqUIJgCjVWnYaS5kRrbA','','T0225KkcRBYf8lLeKRz1lvBYcwCjVWnYaS5kRrbA','T0225KkcREhNowWFcR_xnaEKfQCjVWnYaS5kRrbA','T0205KkcNXRZizWVf0yHw5ZzCjVWnYaS5kRrbA','T0225KkcRhpK81PVdkz2lPdbdQCjVWnYaS5kRrbA','T019-ak5OEVvtjWycX217JICjVWnYaS5kRrbA','T0225KkcRxwRowLQJxPwwv4DdgCjVWnYaS5kRrbA','T0225KkcRhcf9lbfJR2mnPAKdACjVWnYaS5kRrbA','T0225KkcRRhMpweFIxPywfJZdACjVWnYaS5kRrbA','T0225KkcREsa_ADTKBn2wvQKdwCjVWnYaS5kRrbA','T019-akuG1ZMkwKxdUOP1J0CjVWnYaS5kRrbA','T0205KkcF1RMgAaxQGe-94hsCjVWnYaS5kRrbA','T0205KkcMU96rhKVXlqL9pZcCjVWnYaS5kRrbA','T012-bgoEUd29lXTCjVWnYaS5kRrbA','T0225KkcRUoZplbfcxigwKIJJQCjVWnYaS5kRrbA','','T015a133lYCuLdlOek4CjVWnYaS5kRrbA','T019-akqMmh6sAW0WF2N1YICjVWnYaS5kRrbA','T0225KkcRRkR81GCIB72l6VYfACjVWnYaS5kRrbA','T0205KkcAWx_lSOESV-A9bddCjVWnYaS5kRrbA','T019-akUE0F6swGjcWGq07ECjVWnYaS5kRrbA','T0205KkcJEVfiy6PW0SR3b5pCjVWnYaS5kRrbA','T0225KkcRUgc9VGDIh_wwKICcgCjVWnYaS5kRrbA','T0225KkcRhgc81TXdBjznaYNJwCjVWnYaS5kRrbA','T0225KkcRRgd8VzRIEz9x_dYJQCjVWnYaS5kRrbA','T0205KkcJ1dsqyqTRn-L1IRzCjVWnYaS5kRrbA','T0225KkcRBtM9F3RIB6ix6JfcACjVWnYaS5kRrbA','T0205KkcBmNMiSqicVmT44xSCjVWnYaS5kRrbA','T0225KkcRxoR_V2EdBr0kqIMcACjVWnYaS5kRrbA','T0205KkcE1x9iz6RZkyd9YJZCjVWnYaS5kRrbA','T0225KkcRRoR8gbRKR38xqEMcgCjVWnYaS5kRrbA','T0104qwtBFse8gCjVWnYaS5kRrbA','T0205KkcPWZLjQuiSHK93bR5CjVWnYaS5kRrbA','T0205KkcM0hjswyJY2ai77JCCjVWnYaS5kRrbA','T0205KkcFmxPogqJSFK20bJdCjVWnYaS5kRrbA','T0106bcvEUBdsACjVWnYaS5kRrbA','T0205KkcGWBjjQWLUWey8rNWCjVWnYaS5kRrbA','T015v_hzQhcZ81HSIR4CjVWnYaS5kRrbA'];
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
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
      await shareCodesFormat();
      await jdFactory()
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdFactory() {
  try {
    await jdfactory_getHomeData();
    await helpFriends();
    // $.newUser !==1 && $.haveProduct === 2，老用户但未选购商品
    // $.newUser === 1新用户
    if ($.newUser === 1) return
    await jdfactory_collectElectricity();//收集产生的电量
    await jdfactory_getTaskDetail();
    await doTask();
    await algorithm();//投入电力逻辑
    await showMsg();
  } catch (e) {
    $.logErr(e)
  }
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`${message}`);
    }
    if (new Date().getHours() === 12) {
      $.msg($.name, '', `${message}`);
    }
    resolve()
  })
}
async function algorithm() {
  // 当心仪的商品存在，并且收集起来的电量满足当前商品所需，就投入
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getHomeData'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.haveProduct = data.data.result.haveProduct;
              $.userName = data.data.result.userName;
              $.newUser = data.data.result.newUser;
              wantProduct = $.isNode() ? (process.env.FACTORAY_WANTPRODUCT_NAME ? process.env.FACTORAY_WANTPRODUCT_NAME : wantProduct) : ($.getdata('FACTORAY_WANTPRODUCT_NAME') ? $.getdata('FACTORAY_WANTPRODUCT_NAME') : wantProduct);
              if (data.data.result.factoryInfo) {
                let { totalScore, useScore, produceScore, remainScore, couponCount, name } = data.data.result.factoryInfo
                console.log(`\n已选商品：${name}`);
                console.log(`当前已投入电量/所需电量：${useScore}/${totalScore}`);
                console.log(`已选商品剩余量：${couponCount}`);
                console.log(`当前总电量：${remainScore * 1 + useScore * 1}`);
                console.log(`当前完成度：${((remainScore * 1 + useScore * 1)/(totalScore * 1)).toFixed(2) * 100}%\n`);
                message += `京东账号${$.index} ${$.nickName}\n`;
                message += `已选商品：${name}\n`;
                message += `当前已投入电量/所需电量：${useScore}/${totalScore}\n`;
                message += `已选商品剩余量：${couponCount}\n`;
                message += `当前总电量：${remainScore * 1 + useScore * 1}\n`;
                message += `当前完成度：${((remainScore * 1 + useScore * 1)/(totalScore * 1)).toFixed(2) * 100}%\n`;
                if (wantProduct) {
                  console.log(`BoxJs或环境变量提供的心仪商品：${wantProduct}\n`);
                  await jdfactory_getProductList(true);
                  let wantProductSkuId = '';
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > - 1) {
                      totalScore = item['fullScore'] * 1;
                      couponCount = item.couponCount;
                      name = item.name;
                    }
                    if (item.name.indexOf(wantProduct) > - 1 && item.couponCount > 0) {
                      wantProductSkuId = item.skuId;
                    }
                  }
                  // console.log(`\n您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${remainScore * 1 + useScore * 1}\n`);
                  if (wantProductSkuId && ((remainScore * 1 + useScore * 1) >= (totalScore * 1 + 100000))) {
                    console.log(`\n提供的心仪商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【满足】兑换此商品所需总电量：${totalScore + 100000}`);
                    console.log(`请去活动页面更换成心仪商品并手动投入电量兑换\n`);
                    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面\n更换成心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                    if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请去活动页面更换成心仪商品并手动投入电量兑换`);
                  } else {
                    console.log(`您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${remainScore * 1 + useScore * 1}\n不满足兑换心仪商品的条件\n`)
                  }
                } else {
                  console.log(`BoxJs或环境变量暂未提供心仪商品\n如需兑换心仪商品，请提供心仪商品名称，否则满足条件后会为您兑换当前所选商品：${name}\n`);
                  if (((remainScore * 1 + useScore * 1) >= totalScore * 1 + 100000) && (couponCount * 1 > 0)) {
                    console.log(`\n所选商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【满足】兑换此商品所需总电量：${totalScore}`);
                    console.log(`BoxJs或环境变量暂未提供心仪商品，下面为您目前选的${name} 发送提示通知\n`);
                    // await jdfactory_addEnergy();
                    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您所选商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面查看`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                    if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n所选商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请速去活动页面查看`);
                  } else {
                    console.log(`\n所选商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【不满足】兑换此商品所需总电量：${totalScore}`)
                    console.log(`故不一次性投入电力，一直放到蓄电池累计\n`);
                  }
                }
              } else {
                console.log(`\n此账号${$.index}${$.nickName}暂未选择商品\n`);
                message += `京东账号${$.index} ${$.nickName}\n`;
                message += `已选商品：暂无\n`;
                message += `心仪商品：${wantProduct ? wantProduct : '暂无'}\n`;
                if (wantProduct) {
                  console.log(`BoxJs或环境变量提供的心仪商品：${wantProduct}\n`);
                  await jdfactory_getProductList(true);
                  let wantProductSkuId = '', name, totalScore, couponCount, remainScore;
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > - 1) {
                      totalScore = item['fullScore'] * 1;
                      couponCount = item.couponCount;
                      name = item.name;
                    }
                    if (item.name.indexOf(wantProduct) > - 1 && item.couponCount > 0) {
                      wantProductSkuId = item.skuId;
                    }
                  }
                  if (totalScore) {
                    // 库存存在您设置的心仪商品
                    message += `心仪商品数量：${couponCount}\n`;
                    message += `心仪商品所需电量：${totalScore}\n`;
                    message += `您当前总电量：${$.batteryValue * 1}\n`;
                    if (wantProductSkuId && (($.batteryValue * 1) >= (totalScore))) {
                      console.log(`\n提供的心仪商品${name}目前数量：${couponCount}，且当前总电量为：${$.batteryValue * 1}，【满足】兑换此商品所需总电量：${totalScore}`);
                      console.log(`请去活动页面选择心仪商品并手动投入电量兑换\n`);
                      $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${$.batteryValue * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面\n选择此心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                      if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${$.batteryValue * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请去活动页面选择此心仪商品并手动投入电量兑换`);
                    } else {
                      console.log(`您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${$.batteryValue * 1}\n不满足兑换心仪商品的条件\n`)
                    }
                  } else {
                    message += `目前库存：暂无您设置的心仪商品\n`;
                  }
                } else {
                  console.log(`BoxJs或环境变量暂未提供心仪商品\n如需兑换心仪商品，请提供心仪商品名称\n`);
                  await jdfactory_getProductList(true);
                  message += `当前剩余最多商品：${$.canMakeList[0] && $.canMakeList[0].name}\n`;
                  message += `兑换所需电量：${$.canMakeList[0] && $.canMakeList[0].fullScore}\n`;
                  message += `您当前总电量：${$.batteryValue * 1}\n`;
                  if ($.canMakeList[0] && $.canMakeList[0].couponCount > 0 && $.batteryValue * 1 >= $.canMakeList[0] && $.canMakeList[0].fullScore) {
                    let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
                    if (new Date(nowTimes).getHours() === 12) {
                      $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}【满足】兑换${$.canMakeList[0] && $.canMakeList[0] && [0].name}所需总电量：${$.canMakeList[0] && $.canMakeList[0].fullScore}\n请点击弹窗直达活动页面\n选择此心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                      if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n${message}【满足】兑换${$.canMakeList[0] && $.canMakeList[0].name}所需总电量：${$.canMakeList[0].fullScore}\n请速去活动页面查看`);
                    }
                  } else {
                    console.log(`\n目前电量${$.batteryValue * 1},不满足兑换 ${$.canMakeList[0] && $.canMakeList[0].name}所需的 ${$.canMakeList[0] && $.canMakeList[0].fullScore}电量\n`)
                  }
                }
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
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
async function helpFriends() {
  for (let code of $.newShareCodes) {
    if (!code) continue
    const helpRes = await jdfactory_collectScore(code);
    if (helpRes.code === 0 && helpRes.data.bizCode === -7) {
      console.log(`助力机会已耗尽，跳出`);
      break
    }
  }
}
async function doTask() {
  if ($.taskVos && $.taskVos.length > 0) {
    for (let item of $.taskVos) {
      if (item.taskType === 1) {
        //关注店铺任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.followShopVo) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 2) {
        //看看商品任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.productInfoVos) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 3) {
        //逛会场任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.shoppingActivityVos) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 10) {
        if (item.status === 1) {
          if (item.threeMealInfoVos[0].status === 1) {
            //可以做此任务
            console.log(`准备做此任务：${item.taskName}`);
            await jdfactory_collectScore(item.threeMealInfoVos[0].taskToken);
          } else if (item.threeMealInfoVos[0].status === 0) {
            console.log(`${item.taskName} 任务已错过时间`)
          }
        } else if (item.status === 2){
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 21) {
        //开通会员任务
        if (item.status === 1) {
          console.log(`此任务：${item.taskName}，跳过`);
          // for (let task of item.brandMemberVos) {
          //   if (task.status === 1) {
          //     await jdfactory_collectScore(task.taskToken);
          //   }
          // }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 13) {
        //每日打卡
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 14) {
        //好友助力
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          // await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 23) {
        //从数码电器首页进入
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          await queryVkComponent();
          await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
    }
  }
}

//领取做完任务的奖励
function jdfactory_collectScore(taskToken) {
  return new Promise(async resolve => {
    await $.wait(1000);
    $.post(taskPostUrl("jdfactory_collectScore", { taskToken }, "jdfactory_collectScore"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.taskVos = data.data.result.taskVos;//任务列表
              console.log(`领取做完任务的奖励：${JSON.stringify(data.data.result)}`);
            } else {
              console.log(JSON.stringify(data))
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
//给商品投入电量
function jdfactory_addEnergy() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_addEnergy"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`给商品投入电量：${JSON.stringify(data.data.result)}`)
              // $.taskConfigVos = data.data.result.taskConfigVos;
              // $.exchangeGiftConfigs = data.data.result.exchangeGiftConfigs;
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

//收集电量
function jdfactory_collectElectricity() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_collectElectricity"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`成功收集${data.data.result.electricityValue}电量，当前蓄电池总电量：${data.data.result.batteryValue}\n`);
              $.batteryValue = data.data.result.batteryValue;
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
//获取任务列表
function jdfactory_getTaskDetail() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_getTaskDetail", {}, "jdfactory_getTaskDetail"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.taskVos = data.data.result.taskVos;//任务列表
              $.taskVos.map(item => {
                if (item.taskType === 14) {
                  console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${item.assistTaskDetailVo.taskToken}\n`)
                }
              })
            }
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
//选择一件商品，只能在 $.newUser !== 1 && $.haveProduct === 2 并且 sellOut === 0的时候可用
function jdfactory_makeProduct(skuId) {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_makeProduct', { skuId }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`选购商品成功：${JSON.stringify(data)}`);
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
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
function queryVkComponent() {
  return new Promise(resolve => {
    const options = {
      "url": `https://api.m.jd.com/client.action?functionId=queryVkComponent`,
      "body": `adid=0E38E9F1-4B4C-40A4-A479-DD15E58A5623&area=19_1601_50258_51885&body={"componentId":"4f953e59a3af4b63b4d7c24f172db3c3","taskParam":"{\\"actId\\":\\"8tHNdJLcqwqhkLNA8hqwNRaNu5f\\"}","cpUid":"8tHNdJLcqwqhkLNA8hqwNRaNu5f","taskSDKVersion":"1.0.3","businessId":"babel"}&build=167436&client=apple&clientVersion=9.2.5&d_brand=apple&d_model=iPhone11,8&eid=eidIf12a8121eas2urxgGc+zS5+UYGu1Nbed7bq8YY+gPd0Q0t+iviZdQsxnK/HTA7AxZzZBrtu1ulwEviYSV3QUuw2XHHC+PFHdNYx1A/3Zt8xYR+d3&isBackground=N&joycious=228&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=88732f840b77821b345bf07fd71f609e6ff12f43&osVersion=14.2&partner=TF&rfs=0000&scope=11&screen=828*1792&sign=792d92f78cc893f43c32a4f0b2203a41&st=1606533009673&sv=122&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJFKw5SxNDrZGH4Sllq/CDN8uyMr2EAv+1xp60Q9gVAW42IfViu/SFHwjfGAvRI6iMot04FU965+8UfAPZTG6MDwxmIWN7YaTL1ACcfUTG3gtkru+D4w9yowDUIzSuB+u+eoLwM7uynPMJMmGspVGyFIgDXC/tmNibL2k6wYgS249Pa2w5xFnYHQ==&uuid=hjudwgohxzVu96krv/T6Hg==&wifiBssid=1b5809fb84adffec2a397007cc235c03`,
      "headers":  {
        "Cookie": cookie,
        "Accept": `*/*`,
        "Connection": `keep-alive`,
        "Content-Type": `application/x-www-form-urlencoded`,
        "Accept-Encoding": `gzip, deflate, br`,
        "Host": `api.m.jd.com`,
        "User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Accept-Language": `zh-Hans-CN;q=1, en-CN;q=0.9`,
      },
      "timeout": 10000,
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.log('queryVkComponent', data)
          if (safeGet(data)) {
            data = JSON.parse(data);
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
//查询当前商品列表
function jdfactory_getProductList(flag = false) {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getProductList'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.canMakeList = [];
              $.canMakeList = data.data.result.canMakeList;//当前可选商品列表 sellOut:1为已抢光，0为目前可选择
              if ($.canMakeList && $.canMakeList.length > 0) {
                $.canMakeList.sort(sortCouponCount);
                console.log(`商品名称       可选状态    剩余量`)
                for (let item of $.canMakeList) {
                  console.log(`${item.name.slice(-4)}         ${item.sellOut === 1 ? '已抢光':'可 选'}      ${item.couponCount}`);
                }
                if (!flag) {
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > -1 && item.couponCount > 0 && item.sellOut === 0) {
                      await jdfactory_makeProduct(item.skuId);
                      break
                    }
                  }
                }
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
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
function sortCouponCount(a, b) {
  return b['couponCount'] - a['couponCount']
}
function jdfactory_getHomeData() {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getHomeData'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            // console.log(data);
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.haveProduct = data.data.result.haveProduct;
              $.userName = data.data.result.userName;
              $.newUser = data.data.result.newUser;
              if (data.data.result.factoryInfo) {
                $.totalScore = data.data.result.factoryInfo.totalScore;//选中的商品，一共需要的电量
                $.userScore = data.data.result.factoryInfo.userScore;//已使用电量
                $.produceScore = data.data.result.factoryInfo.produceScore;//此商品已投入电量
                $.remainScore = data.data.result.factoryInfo.remainScore;//当前蓄电池电量
                $.couponCount = data.data.result.factoryInfo.couponCount;//已选中商品当前剩余量
                $.hasProduceName = data.data.result.factoryInfo.name;//已选中商品当前剩余量
              }
              if ($.newUser === 1) {
                //新用户
                console.log(`此京东账号${$.index}${$.nickName}为新用户暂未开启${$.name}活动\n现在为您从库存里面现有数量中选择一商品`);
                if ($.haveProduct === 2) {
                  await jdfactory_getProductList();//选购商品
                }
                // $.msg($.name, '暂未开启活动', `京东账号${$.index}${$.nickName}暂未开启${$.name}活动\n请去京东APP->搜索'玩一玩'->东东工厂->开启\n或点击弹窗即可到达${$.name}活动`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
              }
              if ($.newUser !== 1 && $.haveProduct === 2) {
                console.log(`此京东账号${$.index}${$.nickName}暂未选购商品\n现在也能为您做任务和收集免费电力`);
                // $.msg($.name, '暂未选购商品', `京东账号${$.index}${$.nickName}暂未选购商品\n请去京东APP->搜索'玩一玩'->东东工厂->选购一件商品\n或点击弹窗即可到达${$.name}活动`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                // await jdfactory_getProductList();//选购商品
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
            }
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
    }
    //const readShareCodeRes = await readShareCode();
    //if (readShareCodeRes && readShareCodeRes.code === 200) {
      //$.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    //}
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    const shareCodes = $.isNode() ? require('./jdFactoryShareCodes.js') : '';
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify($.shareCodesArr)}`);
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.1.0`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "api.m.jd.com",
      "Origin": "https://h5.m.jd.com",
      "Referer": "https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html",
      "User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    },
    timeout: 10000,
  }
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
      },
      "timeout": 10000,
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
