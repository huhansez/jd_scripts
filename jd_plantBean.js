/*
种豆得豆 脚本更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js
更新时间：2021-04-9
活动入口：京东APP我的-更多工具-种豆得豆
已支持IOS京东多账号,云端多京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
注：会自动关注任务中的店铺跟商品，介意者勿使用。
互助码shareCode请先手动运行脚本查看打印可看到
每个京东账号每天只能帮助3个人。多出的助力码将会助力失败。
=====================================Quantumult X=================================
[task_local]
1 7-21/2 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js, tag=种豆得豆, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdzd.png, enabled=true

=====================================Loon================================
[Script]
cron "1 7-21/2 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js,tag=京东种豆得豆

======================================Surge==========================
京东种豆得豆 = type=cron,cronexp="1 7-21/2 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js

====================================小火箭=============================
京东种豆得豆 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js, cronexpr="1 7-21/2 * * *", timeout=3600, enable=true

搬的https://github.com/uniqueque/QuantumultX/blob/4c1572d93d4d4f883f483f907120a75d925a693e/Script/jd_plantBean.js
*/
const $ = new Env('京东种豆得豆');
//Node.js用户请在jdCookie.js处填写京东ck;
//ios等软件用户直接用NobyDa的jd cookie
let jdNotify = true;//是否开启静默运行。默认true开启
let cookiesArr = [], cookie = '', jdPlantBeanShareArr = [], isBox = false, notify, newShareCodes, option, message,subTitle;
//京东接口地址
const JD_API_HOST = 'https://api.m.jd.com/client.action';
//助力好友分享码(最多3个,否则后面的助力失败)
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // IOS本地脚本用户这个列表填入你要助力的好友的shareCode
                   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  'vyorkdfh4vmmddrd3ffi6kq3pf76owquta33emi@63i3keoha5thxnc5jhfc422u4m5ac3f4ijdgqji@e7lhibzb3zek2y5mqybygs5qdxj5nev4ell57fq@fg66qvubx3wwj7p5fimbyznfq5jsxgpsdfumn3q@3nds3dh2ebzauntc62djcdgwom3h7wlwy7o5jii@4npkonnsy7xi3mupoowoxklbaiknfuwa2dgnddy@e7lhibzb3zek3iqkilu2q3cd3lewbt336de2qyy@5jzx5qtdn6onfyinuginbufty3trpfjfz4m7fyq@okj5ibnh3onz7ku43dtabdr5s7nba4udx6q4zsi@xmblfgd3rmwo4zfojooljnzauwcml3zjy7w7ojq@4npkonnsy7xi22rnrzekyyi4mtoawvuaq374hyq@qvg6dqsrxpyim57efmwijlzu5m@mlrdw3aw26j3xxhli67dodtqgkwurwoke37o5ca@olmijoxgmjutzjky7vf4kun6b6ly4nihi2z5tbi@mlrdw3aw26j3xpndndjvrz2uuinf3p2mkfgqjwq@mlrdw3aw26j3xfr5jqpwrvacfjwf4dws64ip5fi@wic23rhcf4klb6amedh23hmlee4whl3allbmzxq@mlrdw3aw26j3wufmxucb6zzbaxwgjl5cbdp2guq@mlrdw3aw26j3xqlbfyb6yjogwskjg6igodolxpa@e7lhibzb3zek25zlaes4u3tiaefxjqv5lfljftq@zql7cj5qkm245jr5jb7dpjn7ffmwd4sh25zvibq@uwgpfl3hsfqp3kgnrfbsgj5u6ryhafiyrncdmaa@o7eiltak46s2x5uxgqcq6qtcub6ai4vasipb7qi@mlrdw3aw26j3wigvxwnhrfjywwaxptweiy6izey@iygkbwsx646tp6ev74zi3qycee5ac3f4ijdgqji@tzz6hdgungtwgxqbg25rpietmm@olmijoxgmjutyz7abaeuikonsxhkwy2keitrkia@mmv7ccb3o32uaoro3ldonc5zma@gffavy5p6skb7o4t33bswnoytq@uqrk36jvxkdva6bpnmlqpm6hbe@4npkonnsy7xi3vfsgjuz44pqo2xdhudfhtnyqiq@jbgjvz5enkadudz4byndo7zytu@dbvbqbvnfi3mgyqxcxwiikakie3h7wlwy7o5jii@4npkonnsy7xi2k2xcxjg3h2wgdqf7xes2eqz4zq@e7lhibzb3zek3d7cpiyda6f56qrszogy7agkhma@olmijoxgmjutzcbyycwrlvk43pe5jbvhqemvaea@4npkonnsy7xi2q2v7kds6sa5bdy6fuxixymzasi@4npkonnsy7xi2tl3g5lnvp3ienh64tewyu3cngq@e7lhibzb3zek25jymj4lfahy4nrezcaydcderrq@mlrdw3aw26j3xy4xbw56qlw3zjefypxbtyyxzrq@olmijoxgmjutzppijfpjmyky7yl4refuebkwwmq@e7lhibzb3zek2c6btpushupwdvjbztzkhnm4jha@h3cggkcy6agkgclkuou6h2kg2f75os6dzeegqkq@l4ex6vx6yynovns26ndqibsebc2736xeycpoq2i@olmijoxgmjutyod2chb35rfzsrmnzw5febqbooy@e7lhibzb3zek2hzmf6oi6nh62ddqicbt2hidq7y@e7lhibzb3zek24im5z4d66iplajlt7g7awl7fyi@bknudbr7e4sqwp6mykoni7ri4anpdydzoanvsfa@e7lhibzb3zek3aepczscmv3l6vq4og2lzm6m23a@olmijoxgmjutyodlre4x5x7xe3uxb4jxxmqbgvi@qmnmamd3ukiwr36btclgn5ci4xqq4sl32bcp7vy@rv3ehcvkzviq4dbirybat3jp7dlddp7nwtfjvra@yjn6d26ldestpwctgdkx7h72uu5ac3f4ijdgqji@cqqx4q6tvwbxb42v26a7nbac4e@4npkonnsy7xi2u4sricc4uwkhobnufhsomb4fja@w27fcuw5zfqtrephky6fyovp7a3h7wlwy7o5jii@mlrdw3aw26j3wwqzxpxnb3m6xlfaazmkd7xmn4y@4npkonnsy7xi245ns4vllomqnylpzrecgzdmwby@gou7sxm3hztwpugeehu4rq4egqiv5ngzdew6m3y@tzz6hdgungtwgxqbg25rpietmm@olmijoxgmjutyk3jx3rra456p5miudqzpnev3ti@nkytooagylmuvqoswv5igvm52e5ac3f4ijdgqji@mlrdw3aw26j3w46hhdsggzfuhjihnvnu7qpgqby@e7lhibzb3zek2elim4vahmweb2st56sr5ibriwy@uwgpfl3hsfqp2u7fcxdhs4gpm6kfthoncv6xgya@mlrdw3aw26j3wlepbfn4t4hzhnvcevwtxtd2ksi@xooz5rk4vgwfnvivycgonsvor5nq2j5zo23bity@gvd27dwf4xtnnefz3tzkrovpru@dhk4ltjrx22jxtk7xwt7wgfrzy5ac3f4ijdgqji@gcdr655xfdjq6ngxiu6fcywqed7lqgngp4cgutq@mlrdw3aw26j3wg3uibt4e6xeass55b74n7kozja@5kuvbyio45zwfu3fdkgzzl5jixfduztdpyy46ay@hzsxvtmuobdm6fchvwcal64fmazjr5gki52kcwi@e7lhibzb3zek3zrmfadppiyrakwjvbdm2j576aq@e7lhibzb3zek3qcsutaf4i2yhe7v3flhi3ue6pi@r37g2qhpgddutxzfu72yynfmte@jusbpjdxrrq4fl7nza7p4hieoa3h7wlwy7o5jii@4npkonnsy7xi3m3waj7uykhag6mcblons4vuzly@olmijoxgmjutyazhu2j63e3lm64cmwrtjanyiia@uqrk36jvxkdva6bpnmlqpm6hbe@mlrdw3aw26j3wtv5ghn6qj2quweknwxezje5ipa@4npkonnsy7xi3754upy7oekee34ak6b5sybb4li@4npkonnsy7xi2jleb7zkkarzueecehujyc6ddbi@olmijoxgmjutzktnbzmb7uf7frhz6qnaskqnqei@lxiwr5axcyqmdgoexlu62i5l5e@rtsljotwy2w34o6w5qoigniirrkj5kq3jvengrq@4npkonnsy7xi3wcjfkamvt5lihgo7vbiohi73yy@okj5ibnh3onz7ku43dtabdr5s7nba4udx6q4zsi@e7lhibzb3zek3gtrxtv4v2usvbrk52cffedulby@l4ex6vx6yynov24a45ilnh4hqiofscu366fqacq@e7lhibzb3zek2bonyqitnlidrnxeljqgvfjlmji@e7lhibzb3zek2htrkz5bhv6g6dvufftco4fy7wa@zwvm54qaknhm5duudykj53gfiq@4npkonnsy7xi2i2sfvunnusaerpapduxpezbuyy@w27fcuw5zfqtrephky6fyovp7a3h7wlwy7o5jii@e7lhibzb3zek2mc4lvuysaf7z5tlrt2rvhxqdha@4npkonnsy7xi37g7piobjyiglrothdpus4i4jxq@e7lhibzb3zek26hzwcrepqktycrordztl6jaxaa@olmijoxgmjutyyc3q7bpsxcfcryawhjid2r3a7q@e7lhibzb3zek2z3h7uktidurwihx6aulsrwyaxy@t62d3rgm6sfaugeqa5trmyrq4i@olmijoxgmjutz5wdmyhfbmsb2h4omyyvmdeblia@eeexxudqtlamplvieuhblnflhmjz3j7ovwuykla@7oivz2mjbmnx4aaheanswxbqywjpylxzdxazzxq@huul5kdlmsyimhm74e6za7dsncww4d2blb7cibi@e7lhibzb3zek3kparwhbmo322ga4dit7feiwhva@vyorkdfh4vmmddrd3ffi6kq3pf76owquta33emi@63i3keoha5thxnc5jhfc422u4m5ac3f4ijdgqji@e7lhibzb3zek2y5mqybygs5qdxj5nev4ell57fq@l4ex6vx6yynov24a45ilnh4hqiofscu366fqacq@olmijoxgmjutzyqfispho6h7563ny3e4v6eprki@e7lhibzb3zek2m63abm4bak6oezrh3o2putwh4y@uznnl3rftbsht42n7bp7dirpd45ac3f4ijdgqji@bknudbr7e4sqxislwlphs2bh4ychonho54hiuai@mlrdw3aw26j3whdtnsbgagmxpyxjmzcxlvkqo2y@4npkonnsy7xi3w37pewp3ax4hgpve7kw7sdnn6y@4npkonnsy7xi3xuunhddusgo7qnmgpp6fqgaxky@olmijoxgmjutzwb3k3niotubs2xnkury2g3wzqq@qwmkwedt5pnudwlpix3f5v73o2i2onvs23wmi2a@yelq445y4jdoxhrv2sfayi42kwqxrsfsa56sx2a@4larfd6ua4ecz7wj6to6mriihn6e4gtpq6vuqdy@olmijoxgmjuty37o7ibtrglreglxnmxqm2lc4ny@mlrdw3aw26j3xte35ueomkzokjllhwlubgukcea@mlrdw3aw26j3x6jo7bhx3wv6rmdvt5lgo54jaoq@4srjlxwmo6kapetifjn6yojtqeuovsfz33uancy@4npkonnsy7xi2w5kxq4zfyvk4arhc7m5gzsgbui@4npkonnsy7xi2ntv3qbh64lin534na5z7jqkqpy@mlrdw3aw26j3wry4dbkhyrc2gc3cjkrzbclg5qa@7qol36k2wexal6zojdxh5xzsirvkl7k32t2lrwi@o7eiltak46s2xszy7q4tnpqkse2edktkvf32kci@hzsxvtmuobdm7s473hpuwp4hu64n25d4kxwzzuq@e7lhibzb3zek2bonyqitnlidrnxeljqgvfjlmji@e7lhibzb3zek2ilvllatgeylntawhb635pdzkwy@e7lhibzb3zek3myodfvsm3pzpzaculguztmhvxa@rxggow4kdwppam4isfejjakigqih6x2gzzxfyqa@e7lhibzb3zek2htrkz5bhv6g6dvufftco4fy7wa@o7eiltak46s2w7wnjwbgeiauzx7qv3hbuqmn6zy@5mn2uwthbqvlyhq44n2almiare@mlrdw3aw26j3xajuzazlb4adi4gb4fnyzxsklky@mlrdw3aw26j3wfnfw5fold3iyi36kj27fbodovi@ga7waqif6fksk4j4o7jiggtxtngnp6qnd7bev6a@olmijoxgmjuty2phpgen2mhehvhwvm3vsifgn4a@4npkonnsy7xi2yjlvm64gdtpj5w3t2pnt3aoedq@wrqpt6mmzjh2zgh3ved45zsziryetgigwxosuty@itplnhngh2a7ej2lnmxth6h4a6sjsirurk3xwoa@igefhjvuw6xvtnef6e2pwfd72334nibwfmsxkqy@olmijoxgmjutz3ml4djui5s2oimtv2qr5nicfuq@mlrdw3aw26j3wv4ifi3icimiub5nlldxn7i6vgi@e7lhibzb3zek3bva7xmmrpncuabyt2lv2oyzyca@e7lhibzb3zek32mf3ainhk3rstzdnf3bnpmlgba@bknudbr7e4sqxk4r2jc36tfo4e36ikdjb32fs6y@t7obxmpebrxkdum2u67q3wikkaf3ftsc27eotpy@uqrk36jvxkdva6bpnmlqpm6hbe@4npkonnsy7xi22rnrzekyyi4mtoawvuaq374hyq@mlrdw3aw26j3w46hhdsggzfuhjihnvnu7qpgqby@mlrdw3aw26j3xxhli67dodtqgkwurwoke37o5ca@xmblfgd3rmwo4zfojooljnzauwcml3zjy7w7ojq@o7eiltak46s2x5uxgqcq6qtcub6ai4vasipb7qi@5kuvbyio45zwfu3fdkgzzl5jixfduztdpyy46ay@mlrdw3aw26j3wetfi5rcvci7nbtvxe6our2w7oa@qvg6dqsrxpyim57efmwijlzu5m@uwgpfl3hsfqp3kgnrfbsgj5u6ryhafiyrncdmaa@e7lhibzb3zek3zrmfadppiyrakwjvbdm2j576aq@rtsljotwy2w34o6w5qoigniirrkj5kq3jvengrq@nkytooagylmuvqoswv5igvm52e5ac3f4ijdgqji@4npkonnsy7xi3z56tcgnmktguguwh3g7qq5jpqa@eeexxudqtlamp2vlvyyq74qk445qo4xs6wi55dq@75cbbmhosdix4obvi2vbu5b3pu@e7lhibzb3zek2shskabisiuil4tpsdvcemmtiqq@e7lhibzb3zek3jhagdku4g5xs26qlbcvrkdqxra@fdari27jrvowbnf5fkhxamzx64@tnmcphpjys5icjhlosccfb7jfypbt6uguovhdqy@sxz4wbp3jfje7xwzzz2rljutdu@4npkonnsy7xi2cdvx3wsw3oppi5atgw5ab2kjna@mlrdw3aw26j3wrigsvbliskcs5qecyzgnapj2yq@5kuvbyio45zwe4fzw52wqhholxcza3d4ffsv3di@olmijoxgmjuty442pkdpxrckpydndipctfygr6i@rxggow4kdwppalaj4k5ulkvltpyvk3aapclqk3q@olmijoxgmjutyt2tj54xjqfbxbmw3rys7i5xjzq@4npkonnsy7xi2jmvhjtrve5pq7buqxcggs44ltq@4npkonnsy7xi274cltlxvvvqs3zqzigf6dmljra@olmijoxgmjutz6rezo7gxtqzpvqmnxb6kj2huva@mlrdw3aw26j3xhiuco5cskvjf5owkciqadkczbq@olmijoxgmjutzphxsrocahzmsfwt4yxbnojgy5q@4larfd6ua4eczdaymt6mozguwmikzxwz4reqp3y@bk35n5wml6rnuan6f5dz2iwb6bsklxiuvl5tmci@olmijoxgmjutyhyd6ea5supxf3s7ikvz4t2cp3q@4npkonnsy7xi3po2kwbvisayafus6tlbro3xtqi@4oupleiwuds2bfjdr62x5jeeiqvglpj45xzwcra@2vgtxj43q3jqyvpqlmyhcoeynzd2bmo7ijzi2mq@4npkonnsy7xi3b76xrq7xjeji2wexhrw6vsswma@iu237u55hwjiprancfzqb2havgl3h4bx4seid2a@npxgjbe3ggq22f24xxqxsonfly@itplnhngh2a7ewyveruvqkwh3xculpest5m5gty@bk35n5wml6rnuan6f5dz2iwb6bsklxiuvl5tmci@e7lhibzb3zek2i6uxbicac5cot5pqpmwkppivia@daflczlzwsc72kcebiuuvubxcy@olmijoxgmjuty7g6qiafgiret7tkbwj2lxjikhq@f5pavyxxlph5p5mrgrixrmjsib7zte5zqoknroy@rtsljotwy2w3536twh4ldozzjjodttyhrnov6ta@dgxz53ypolres6sgpwgdo6sgva@5m6fhyzpidp3wn25v5n6nno6sgfwvydif22vhiy',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  'vyorkdfh4vmmddrd3ffi6kq3pf76owquta33emi@63i3keoha5thxnc5jhfc422u4m5ac3f4ijdgqji@e7lhibzb3zek2y5mqybygs5qdxj5nev4ell57fq@fg66qvubx3wwj7p5fimbyznfq5jsxgpsdfumn3q@3nds3dh2ebzauntc62djcdgwom3h7wlwy7o5jii@4npkonnsy7xi3mupoowoxklbaiknfuwa2dgnddy@e7lhibzb3zek3iqkilu2q3cd3lewbt336de2qyy@5jzx5qtdn6onfyinuginbufty3trpfjfz4m7fyq@okj5ibnh3onz7ku43dtabdr5s7nba4udx6q4zsi@xmblfgd3rmwo4zfojooljnzauwcml3zjy7w7ojq@4npkonnsy7xi22rnrzekyyi4mtoawvuaq374hyq@qvg6dqsrxpyim57efmwijlzu5m@mlrdw3aw26j3xxhli67dodtqgkwurwoke37o5ca@olmijoxgmjutzjky7vf4kun6b6ly4nihi2z5tbi@mlrdw3aw26j3xpndndjvrz2uuinf3p2mkfgqjwq@mlrdw3aw26j3xfr5jqpwrvacfjwf4dws64ip5fi@wic23rhcf4klb6amedh23hmlee4whl3allbmzxq@mlrdw3aw26j3wufmxucb6zzbaxwgjl5cbdp2guq@mlrdw3aw26j3xqlbfyb6yjogwskjg6igodolxpa@e7lhibzb3zek25zlaes4u3tiaefxjqv5lfljftq@zql7cj5qkm245jr5jb7dpjn7ffmwd4sh25zvibq@uwgpfl3hsfqp3kgnrfbsgj5u6ryhafiyrncdmaa@o7eiltak46s2x5uxgqcq6qtcub6ai4vasipb7qi@mlrdw3aw26j3wigvxwnhrfjywwaxptweiy6izey@iygkbwsx646tp6ev74zi3qycee5ac3f4ijdgqji@tzz6hdgungtwgxqbg25rpietmm@olmijoxgmjutyz7abaeuikonsxhkwy2keitrkia@mmv7ccb3o32uaoro3ldonc5zma@gffavy5p6skb7o4t33bswnoytq@uqrk36jvxkdva6bpnmlqpm6hbe@4npkonnsy7xi3vfsgjuz44pqo2xdhudfhtnyqiq@jbgjvz5enkadudz4byndo7zytu@dbvbqbvnfi3mgyqxcxwiikakie3h7wlwy7o5jii@4npkonnsy7xi2k2xcxjg3h2wgdqf7xes2eqz4zq@e7lhibzb3zek3d7cpiyda6f56qrszogy7agkhma@olmijoxgmjutzcbyycwrlvk43pe5jbvhqemvaea@4npkonnsy7xi2q2v7kds6sa5bdy6fuxixymzasi@4npkonnsy7xi2tl3g5lnvp3ienh64tewyu3cngq@e7lhibzb3zek25jymj4lfahy4nrezcaydcderrq@mlrdw3aw26j3xy4xbw56qlw3zjefypxbtyyxzrq@olmijoxgmjutzppijfpjmyky7yl4refuebkwwmq@e7lhibzb3zek2c6btpushupwdvjbztzkhnm4jha@h3cggkcy6agkgclkuou6h2kg2f75os6dzeegqkq@l4ex6vx6yynovns26ndqibsebc2736xeycpoq2i@olmijoxgmjutyod2chb35rfzsrmnzw5febqbooy@e7lhibzb3zek2hzmf6oi6nh62ddqicbt2hidq7y@e7lhibzb3zek24im5z4d66iplajlt7g7awl7fyi@bknudbr7e4sqwp6mykoni7ri4anpdydzoanvsfa@e7lhibzb3zek3aepczscmv3l6vq4og2lzm6m23a@olmijoxgmjutyodlre4x5x7xe3uxb4jxxmqbgvi@qmnmamd3ukiwr36btclgn5ci4xqq4sl32bcp7vy@rv3ehcvkzviq4dbirybat3jp7dlddp7nwtfjvra@yjn6d26ldestpwctgdkx7h72uu5ac3f4ijdgqji@cqqx4q6tvwbxb42v26a7nbac4e@4npkonnsy7xi2u4sricc4uwkhobnufhsomb4fja@w27fcuw5zfqtrephky6fyovp7a3h7wlwy7o5jii@mlrdw3aw26j3wwqzxpxnb3m6xlfaazmkd7xmn4y@4npkonnsy7xi245ns4vllomqnylpzrecgzdmwby@gou7sxm3hztwpugeehu4rq4egqiv5ngzdew6m3y@tzz6hdgungtwgxqbg25rpietmm@olmijoxgmjutyk3jx3rra456p5miudqzpnev3ti@nkytooagylmuvqoswv5igvm52e5ac3f4ijdgqji@mlrdw3aw26j3w46hhdsggzfuhjihnvnu7qpgqby@e7lhibzb3zek2elim4vahmweb2st56sr5ibriwy@uwgpfl3hsfqp2u7fcxdhs4gpm6kfthoncv6xgya@mlrdw3aw26j3wlepbfn4t4hzhnvcevwtxtd2ksi@xooz5rk4vgwfnvivycgonsvor5nq2j5zo23bity@gvd27dwf4xtnnefz3tzkrovpru@dhk4ltjrx22jxtk7xwt7wgfrzy5ac3f4ijdgqji@gcdr655xfdjq6ngxiu6fcywqed7lqgngp4cgutq@mlrdw3aw26j3wg3uibt4e6xeass55b74n7kozja@5kuvbyio45zwfu3fdkgzzl5jixfduztdpyy46ay@hzsxvtmuobdm6fchvwcal64fmazjr5gki52kcwi@e7lhibzb3zek3zrmfadppiyrakwjvbdm2j576aq@e7lhibzb3zek3qcsutaf4i2yhe7v3flhi3ue6pi@r37g2qhpgddutxzfu72yynfmte@jusbpjdxrrq4fl7nza7p4hieoa3h7wlwy7o5jii@4npkonnsy7xi3m3waj7uykhag6mcblons4vuzly@olmijoxgmjutyazhu2j63e3lm64cmwrtjanyiia@uqrk36jvxkdva6bpnmlqpm6hbe@mlrdw3aw26j3wtv5ghn6qj2quweknwxezje5ipa@4npkonnsy7xi3754upy7oekee34ak6b5sybb4li@4npkonnsy7xi2jleb7zkkarzueecehujyc6ddbi@olmijoxgmjutzktnbzmb7uf7frhz6qnaskqnqei@lxiwr5axcyqmdgoexlu62i5l5e@rtsljotwy2w34o6w5qoigniirrkj5kq3jvengrq@4npkonnsy7xi3wcjfkamvt5lihgo7vbiohi73yy@okj5ibnh3onz7ku43dtabdr5s7nba4udx6q4zsi@e7lhibzb3zek3gtrxtv4v2usvbrk52cffedulby@l4ex6vx6yynov24a45ilnh4hqiofscu366fqacq@e7lhibzb3zek2bonyqitnlidrnxeljqgvfjlmji@e7lhibzb3zek2htrkz5bhv6g6dvufftco4fy7wa@zwvm54qaknhm5duudykj53gfiq@4npkonnsy7xi2i2sfvunnusaerpapduxpezbuyy@w27fcuw5zfqtrephky6fyovp7a3h7wlwy7o5jii@e7lhibzb3zek2mc4lvuysaf7z5tlrt2rvhxqdha@4npkonnsy7xi37g7piobjyiglrothdpus4i4jxq@e7lhibzb3zek26hzwcrepqktycrordztl6jaxaa@olmijoxgmjutyyc3q7bpsxcfcryawhjid2r3a7q@e7lhibzb3zek2z3h7uktidurwihx6aulsrwyaxy@t62d3rgm6sfaugeqa5trmyrq4i@olmijoxgmjutz5wdmyhfbmsb2h4omyyvmdeblia@eeexxudqtlamplvieuhblnflhmjz3j7ovwuykla@7oivz2mjbmnx4aaheanswxbqywjpylxzdxazzxq@huul5kdlmsyimhm74e6za7dsncww4d2blb7cibi@e7lhibzb3zek3kparwhbmo322ga4dit7feiwhva@vyorkdfh4vmmddrd3ffi6kq3pf76owquta33emi@63i3keoha5thxnc5jhfc422u4m5ac3f4ijdgqji@e7lhibzb3zek2y5mqybygs5qdxj5nev4ell57fq@l4ex6vx6yynov24a45ilnh4hqiofscu366fqacq@olmijoxgmjutzyqfispho6h7563ny3e4v6eprki@e7lhibzb3zek2m63abm4bak6oezrh3o2putwh4y@uznnl3rftbsht42n7bp7dirpd45ac3f4ijdgqji@bknudbr7e4sqxislwlphs2bh4ychonho54hiuai@mlrdw3aw26j3whdtnsbgagmxpyxjmzcxlvkqo2y@4npkonnsy7xi3w37pewp3ax4hgpve7kw7sdnn6y@4npkonnsy7xi3xuunhddusgo7qnmgpp6fqgaxky@olmijoxgmjutzwb3k3niotubs2xnkury2g3wzqq@qwmkwedt5pnudwlpix3f5v73o2i2onvs23wmi2a@yelq445y4jdoxhrv2sfayi42kwqxrsfsa56sx2a@4larfd6ua4ecz7wj6to6mriihn6e4gtpq6vuqdy@olmijoxgmjuty37o7ibtrglreglxnmxqm2lc4ny@mlrdw3aw26j3xte35ueomkzokjllhwlubgukcea@mlrdw3aw26j3x6jo7bhx3wv6rmdvt5lgo54jaoq@4srjlxwmo6kapetifjn6yojtqeuovsfz33uancy@4npkonnsy7xi2w5kxq4zfyvk4arhc7m5gzsgbui@4npkonnsy7xi2ntv3qbh64lin534na5z7jqkqpy@mlrdw3aw26j3wry4dbkhyrc2gc3cjkrzbclg5qa@7qol36k2wexal6zojdxh5xzsirvkl7k32t2lrwi@o7eiltak46s2xszy7q4tnpqkse2edktkvf32kci@hzsxvtmuobdm7s473hpuwp4hu64n25d4kxwzzuq@e7lhibzb3zek2bonyqitnlidrnxeljqgvfjlmji@e7lhibzb3zek2ilvllatgeylntawhb635pdzkwy@e7lhibzb3zek3myodfvsm3pzpzaculguztmhvxa@rxggow4kdwppam4isfejjakigqih6x2gzzxfyqa@e7lhibzb3zek2htrkz5bhv6g6dvufftco4fy7wa@o7eiltak46s2w7wnjwbgeiauzx7qv3hbuqmn6zy@5mn2uwthbqvlyhq44n2almiare@mlrdw3aw26j3xajuzazlb4adi4gb4fnyzxsklky@mlrdw3aw26j3wfnfw5fold3iyi36kj27fbodovi@ga7waqif6fksk4j4o7jiggtxtngnp6qnd7bev6a@olmijoxgmjuty2phpgen2mhehvhwvm3vsifgn4a@4npkonnsy7xi2yjlvm64gdtpj5w3t2pnt3aoedq@wrqpt6mmzjh2zgh3ved45zsziryetgigwxosuty@itplnhngh2a7ej2lnmxth6h4a6sjsirurk3xwoa@igefhjvuw6xvtnef6e2pwfd72334nibwfmsxkqy@olmijoxgmjutz3ml4djui5s2oimtv2qr5nicfuq@mlrdw3aw26j3wv4ifi3icimiub5nlldxn7i6vgi@e7lhibzb3zek3bva7xmmrpncuabyt2lv2oyzyca@e7lhibzb3zek32mf3ainhk3rstzdnf3bnpmlgba@bknudbr7e4sqxk4r2jc36tfo4e36ikdjb32fs6y@t7obxmpebrxkdum2u67q3wikkaf3ftsc27eotpy@uqrk36jvxkdva6bpnmlqpm6hbe@4npkonnsy7xi22rnrzekyyi4mtoawvuaq374hyq@mlrdw3aw26j3w46hhdsggzfuhjihnvnu7qpgqby@mlrdw3aw26j3xxhli67dodtqgkwurwoke37o5ca@xmblfgd3rmwo4zfojooljnzauwcml3zjy7w7ojq@o7eiltak46s2x5uxgqcq6qtcub6ai4vasipb7qi@5kuvbyio45zwfu3fdkgzzl5jixfduztdpyy46ay@mlrdw3aw26j3wetfi5rcvci7nbtvxe6our2w7oa@qvg6dqsrxpyim57efmwijlzu5m@uwgpfl3hsfqp3kgnrfbsgj5u6ryhafiyrncdmaa@e7lhibzb3zek3zrmfadppiyrakwjvbdm2j576aq@rtsljotwy2w34o6w5qoigniirrkj5kq3jvengrq@nkytooagylmuvqoswv5igvm52e5ac3f4ijdgqji@4npkonnsy7xi3z56tcgnmktguguwh3g7qq5jpqa@eeexxudqtlamp2vlvyyq74qk445qo4xs6wi55dq@75cbbmhosdix4obvi2vbu5b3pu@e7lhibzb3zek2shskabisiuil4tpsdvcemmtiqq@e7lhibzb3zek3jhagdku4g5xs26qlbcvrkdqxra@fdari27jrvowbnf5fkhxamzx64@tnmcphpjys5icjhlosccfb7jfypbt6uguovhdqy@sxz4wbp3jfje7xwzzz2rljutdu@4npkonnsy7xi2cdvx3wsw3oppi5atgw5ab2kjna@mlrdw3aw26j3wrigsvbliskcs5qecyzgnapj2yq@5kuvbyio45zwe4fzw52wqhholxcza3d4ffsv3di@olmijoxgmjuty442pkdpxrckpydndipctfygr6i@rxggow4kdwppalaj4k5ulkvltpyvk3aapclqk3q@olmijoxgmjutyt2tj54xjqfbxbmw3rys7i5xjzq@4npkonnsy7xi2jmvhjtrve5pq7buqxcggs44ltq@4npkonnsy7xi274cltlxvvvqs3zqzigf6dmljra@olmijoxgmjutz6rezo7gxtqzpvqmnxb6kj2huva@mlrdw3aw26j3xhiuco5cskvjf5owkciqadkczbq@olmijoxgmjutzphxsrocahzmsfwt4yxbnojgy5q@4larfd6ua4eczdaymt6mozguwmikzxwz4reqp3y@bk35n5wml6rnuan6f5dz2iwb6bsklxiuvl5tmci@olmijoxgmjutyhyd6ea5supxf3s7ikvz4t2cp3q@4npkonnsy7xi3po2kwbvisayafus6tlbro3xtqi@4oupleiwuds2bfjdr62x5jeeiqvglpj45xzwcra@2vgtxj43q3jqyvpqlmyhcoeynzd2bmo7ijzi2mq@4npkonnsy7xi3b76xrq7xjeji2wexhrw6vsswma@iu237u55hwjiprancfzqb2havgl3h4bx4seid2a@npxgjbe3ggq22f24xxqxsonfly@itplnhngh2a7ewyveruvqkwh3xculpest5m5gty@bk35n5wml6rnuan6f5dz2iwb6bsklxiuvl5tmci@e7lhibzb3zek2i6uxbicac5cot5pqpmwkppivia@daflczlzwsc72kcebiuuvubxcy@olmijoxgmjuty7g6qiafgiret7tkbwj2lxjikhq@f5pavyxxlph5p5mrgrixrmjsib7zte5zqoknroy@rtsljotwy2w3536twh4ldozzjjodttyhrnov6ta@dgxz53ypolres6sgpwgdo6sgva@5m6fhyzpidp3wn25v5n6nno6sgfwvydif22vhiy',
]
let allMessage = ``;
let currentRoundId = null;//本期活动id
let lastRoundId = null;//上期id
let roundList = [];
let awardState = '';//上期活动的京豆是否收取
let randomCount = $.isNode() ? 20 : 5;
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
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      option = {};
      await shareCodesFormat();
      await jdPlantBean();
      await showMsg();
    }
  }
  if ($.isNode() && allMessage) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done();
})

async function jdPlantBean() {
  try {
    console.log(`获取任务及基本信息`)
    await plantBeanIndex();
    // console.log(plantBeanIndexResult.data.taskList);
    if ($.plantBeanIndexResult && $.plantBeanIndexResult.code === '0' && $.plantBeanIndexResult.data) {
      const shareUrl = $.plantBeanIndexResult.data.jwordShareInfo.shareUrl
      $.myPlantUuid = getParam(shareUrl, 'plantUuid')
      console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.myPlantUuid}\n`);
      roundList = $.plantBeanIndexResult.data.roundList;
      currentRoundId = roundList[1].roundId;//本期的roundId
      lastRoundId = roundList[0].roundId;//上期的roundId
      awardState = roundList[0].awardState;
      $.taskList = $.plantBeanIndexResult.data.taskList;
      subTitle = `【京东昵称】${$.plantBeanIndexResult.data.plantUserInfo.plantNickName}`;
      message += `【上期时间】${roundList[0].dateDesc.replace('上期 ', '')}\n`;
      message += `【上期成长值】${roundList[0].growth}\n`;
      await receiveNutrients();//定时领取营养液
      await doHelp();//助力
      await doTask();//做日常任务
      await doEgg();
      await stealFriendWater();
      await doCultureBean();
      await doGetReward();
      await showTaskProcess();
      await plantShareSupportList();
    } else {
      console.log(`种豆得豆-初始失败:  ${JSON.stringify($.plantBeanIndexResult)}`);
    }
  } catch (e) {
    $.logErr(e);
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
    $.msg($.name, '', `${errMsg}`)
  }
}
async function doGetReward() {
  console.log(`【上轮京豆】${awardState === '4' ? '采摘中' : awardState === '5' ? '可收获了' : '已领取'}`);
  if (awardState === '4') {
    //京豆采摘中...
    message += `【上期状态】${roundList[0].tipBeanEndTitle}\n`;
  } else if (awardState === '5') {
    //收获
    await getReward();
    console.log('开始领取京豆');
    if ($.getReward && $.getReward.code === '0') {
      console.log('京豆领取成功');
      message += `【上期兑换京豆】${$.getReward.data.awardBean}个\n`;
      $.msg($.name, subTitle, message);
      allMessage += `京东账号${$.index} ${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`
      // if ($.isNode()) {
      //   await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}`, `京东账号${$.index} ${$.nickName}\n${message}`);
      // }
    } else {
      console.log(`$.getReward 异常：${JSON.stringify($.getReward)}`)
    }
  } else if (awardState === '6') {
    //京豆已领取
    message += `【上期兑换京豆】${roundList[0].awardBeans}个\n`;
  }
  if (roundList[1].dateDesc.indexOf('本期 ') > -1) {
    roundList[1].dateDesc = roundList[1].dateDesc.substr(roundList[1].dateDesc.indexOf('本期 ') + 3, roundList[1].dateDesc.length);
  }
  message += `【本期时间】${roundList[1].dateDesc}\n`;
  message += `【本期成长值】${roundList[1].growth}\n`;
}
async function doCultureBean() {
  await plantBeanIndex();
  if ($.plantBeanIndexResult && $.plantBeanIndexResult.code === '0') {
    const plantBeanRound = $.plantBeanIndexResult.data.roundList[1]
    if (plantBeanRound.roundState === '2') {
      //收取营养液
      if (plantBeanRound.bubbleInfos && plantBeanRound.bubbleInfos.length) console.log(`开始收取营养液`)
      for (let bubbleInfo of plantBeanRound.bubbleInfos) {
        console.log(`收取-${bubbleInfo.name}-的营养液`)
        await cultureBean(plantBeanRound.roundId, bubbleInfo.nutrientsType)
        console.log(`收取营养液结果:${JSON.stringify($.cultureBeanRes)}`)
      }
    }
  } else {
    console.log(`plantBeanIndexResult:${JSON.stringify($.plantBeanIndexResult)}`)
  }
}
async function stealFriendWater() {
  await stealFriendList();
  if ($.stealFriendList && $.stealFriendList.code === '0') {
    if ($.stealFriendList.data && $.stealFriendList.data.tips) {
      console.log('\n\n今日偷取好友营养液已达上限\n\n');
      return
    }
    if ($.stealFriendList.data && $.stealFriendList.data.friendInfoList && $.stealFriendList.data.friendInfoList.length > 0) {
      let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
      for (let item of $.stealFriendList.data.friendInfoList) {
        if (new Date(nowTimes).getHours() === 20) {
          if (item.nutrCount >= 2) {
            // console.log(`可以偷的好友的信息::${JSON.stringify(item)}`);
            console.log(`可以偷的好友的信息paradiseUuid::${JSON.stringify(item.paradiseUuid)}`);
            await collectUserNutr(item.paradiseUuid);
            console.log(`偷取好友营养液情况:${JSON.stringify($.stealFriendRes)}`)
            if ($.stealFriendRes && $.stealFriendRes.code === '0') {
              console.log(`偷取好友营养液成功`)
            }
          }
        } else {
          if (item.nutrCount >= 3) {
            // console.log(`可以偷的好友的信息::${JSON.stringify(item)}`);
            console.log(`可以偷的好友的信息paradiseUuid::${JSON.stringify(item.paradiseUuid)}`);
            await collectUserNutr(item.paradiseUuid);
            console.log(`偷取好友营养液情况:${JSON.stringify($.stealFriendRes)}`)
            if ($.stealFriendRes && $.stealFriendRes.code === '0') {
              console.log(`偷取好友营养液成功`)
            }
          }
        }
      }
    }
  } else {
    console.log(`$.stealFriendList 异常： ${JSON.stringify($.stealFriendList)}`)
  }
}
async function doEgg() {
  await egg();
  if ($.plantEggLotteryRes && $.plantEggLotteryRes.code === '0') {
    if ($.plantEggLotteryRes.data.restLotteryNum > 0) {
      const eggL = new Array($.plantEggLotteryRes.data.restLotteryNum).fill('');
      console.log(`目前共有${eggL.length}次扭蛋的机会`)
      for (let i = 0; i < eggL.length; i++) {
        console.log(`开始第${i + 1}次扭蛋`);
        await plantEggDoLottery();
        console.log(`天天扭蛋成功：${JSON.stringify($.plantEggDoLotteryResult)}`);
      }
    } else {
      console.log('暂无扭蛋机会')
    }
  } else {
    console.log('查询天天扭蛋的机会失败' + JSON.stringify($.plantEggLotteryRes))
  }
}
async function doTask() {
  if ($.taskList && $.taskList.length > 0) {
    for (let item of $.taskList) {
      if (item.isFinished === 1) {
        console.log(`${item.taskName} 任务已完成\n`);
        continue;
      } else {
        if (item.taskType === 8) {
          console.log(`\n【${item.taskName}】任务未完成,需自行手动去京东APP完成，${item.desc}营养液\n`)
        } else {
          console.log(`\n【${item.taskName}】任务未完成,${item.desc}营养液\n`)
        }
      }
      if (item.dailyTimes === 1 && item.taskType !== 8) {
        console.log(`\n开始做 ${item.taskName}任务`);
        // $.receiveNutrientsTaskRes = await receiveNutrientsTask(item.taskType);
        await receiveNutrientsTask(item.taskType);
        console.log(`做 ${item.taskName}任务结果:${JSON.stringify($.receiveNutrientsTaskRes)}\n`);
      }
      if (item.taskType === 3) {
        //浏览店铺
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedShopNum = item.totalNum - item.gainedNum;
        if (unFinishedShopNum === 0) {
          continue
        }
        await shopTaskList();
        const { data } = $.shopTaskListRes;
        let goodShopListARR = [], moreShopListARR = [], shopList = [];
        const { goodShopList, moreShopList } = data;
        for (let i of goodShopList) {
          if (i.taskState === '2') {
            goodShopListARR.push(i);
          }
        }
        for (let j of moreShopList) {
          if (j.taskState === '2') {
            moreShopListARR.push(j);
          }
        }
        shopList = goodShopListARR.concat(moreShopListARR);
        for (let shop of shopList) {
          const { shopId, shopTaskId } = shop;
          const body = {
            "monitor_refer": "plant_shopNutrientsTask",
            "shopId": shopId,
            "shopTaskId": shopTaskId
          }
          const shopRes = await requestGet('shopNutrientsTask', body);
          console.log(`shopRes结果:${JSON.stringify(shopRes)}`);
          if (shopRes && shopRes.code === '0') {
            if (shopRes.data && shopRes.data.nutrState && shopRes.data.nutrState === '1') {
              unFinishedShopNum --;
            }
          }
          if (unFinishedShopNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
      if (item.taskType === 5) {
        //挑选商品
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedProductNum = item.totalNum - item.gainedNum;
        if (unFinishedProductNum === 0) {
          continue
        }
        await productTaskList();
        // console.log('productTaskList', $.productTaskList);
        const { data } = $.productTaskList;
        let productListARR = [], productList = [];
        const { productInfoList } = data;
        for (let i = 0; i < productInfoList.length; i++) {
          for (let j = 0; j < productInfoList[i].length; j++){
            productListARR.push(productInfoList[i][j]);
          }
        }
        for (let i of productListARR) {
          if (i.taskState === '2') {
            productList.push(i);
          }
        }
        for (let product of productList) {
          const { skuId, productTaskId } = product;
          const body = {
            "monitor_refer": "plant_productNutrientsTask",
            "productTaskId": productTaskId,
            "skuId": skuId
          }
          const productRes = await requestGet('productNutrientsTask', body);
          if (productRes && productRes.code === '0') {
            // console.log('nutrState', productRes)
            //这里添加多重判断,有时候会出现活动太火爆的问题,导致nutrState没有
            if (productRes.data && productRes.data.nutrState && productRes.data.nutrState === '1') {
              unFinishedProductNum --;
            }
          }
          if (unFinishedProductNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
      if (item.taskType === 10) {
        //关注频道
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedChannelNum = item.totalNum - item.gainedNum;
        if (unFinishedChannelNum === 0) {
          continue
        }
        await plantChannelTaskList();
        const { data } = $.plantChannelTaskList;
        // console.log('goodShopList', data.goodShopList);
        // console.log('moreShopList', data.moreShopList);
        let goodChannelListARR = [], normalChannelListARR = [], channelList = [];
        const { goodChannelList, normalChannelList } = data;
        for (let i of goodChannelList) {
          if (i.taskState === '2') {
            goodChannelListARR.push(i);
          }
        }
        for (let j of normalChannelList) {
          if (j.taskState === '2') {
            normalChannelListARR.push(j);
          }
        }
        channelList = goodChannelListARR.concat(normalChannelListARR);
        for (let channelItem of channelList) {
          const { channelId, channelTaskId } = channelItem;
          const body = {
            "channelId": channelId,
            "channelTaskId": channelTaskId
          }
          const channelRes = await requestGet('plantChannelNutrientsTask', body);
          console.log(`channelRes结果:${JSON.stringify(channelRes)}`);
          if (channelRes && channelRes.code === '0') {
            if (channelRes.data && channelRes.data.nutrState && channelRes.data.nutrState === '1') {
              unFinishedChannelNum --;
            }
          }
          if (unFinishedChannelNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
    }
  }
}
function showTaskProcess() {
  return new Promise(async resolve => {
    await plantBeanIndex();
    $.taskList = $.plantBeanIndexResult.data.taskList;
    if ($.taskList && $.taskList.length > 0) {
      console.log("     任务   进度");
      for (let item of $.taskList) {
        console.log(`[${item["taskName"]}]  ${item["gainedNum"]}/${item["totalNum"]}   ${item["isFinished"]}`);
      }
    }
    resolve()
  })
}
//助力好友
async function doHelp() {
  for (let plantUuid of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${plantUuid}`);
    if (!plantUuid) continue;
    if (plantUuid === $.myPlantUuid) {
      console.log(`\n跳过自己的plantUuid\n`)
      continue
    }
    await helpShare(plantUuid);
    if ($.helpResult && $.helpResult.code === '0') {
      // console.log(`助力好友结果: ${JSON.stringify($.helpResult.data.helpShareRes)}`);
      if ($.helpResult.data.helpShareRes) {
        if ($.helpResult.data.helpShareRes.state === '1') {
          console.log(`助力好友${plantUuid}成功`)
          console.log(`${$.helpResult.data.helpShareRes.promptText}\n`);
        } else if ($.helpResult.data.helpShareRes.state === '2') {
          console.log('您今日助力的机会已耗尽，已不能再帮助好友助力了\n');
          break;
        } else if ($.helpResult.data.helpShareRes.state === '3') {
          console.log('该好友今日已满9人助力/20瓶营养液,明天再来为Ta助力吧\n')
        } else if ($.helpResult.data.helpShareRes.state === '4') {
          console.log(`${$.helpResult.data.helpShareRes.promptText}\n`)
        } else {
          console.log(`助力其他情况：${JSON.stringify($.helpResult.data.helpShareRes)}`);
        }
      }
    } else {
      console.log(`助力好友失败: ${JSON.stringify($.helpResult)}`);
    }
  }
}
function showMsg() {
  $.log(`\n${message}\n`);
  jdNotify = $.getdata('jdPlantBeanNotify') ? $.getdata('jdPlantBeanNotify') : jdNotify;
  if (!jdNotify || jdNotify === 'false') {
    $.msg($.name, subTitle, message);
  }
}
// ================================================此处是API=================================
//每轮种豆活动获取结束后,自动收取京豆
async function getReward() {
  const body = {
    "roundId": lastRoundId
  }
  $.getReward = await request('receivedBean', body);
}
//收取营养液
async function cultureBean(currentRoundId, nutrientsType) {
  let functionId = arguments.callee.name.toString();
  let body = {
    "roundId": currentRoundId,
    "nutrientsType": nutrientsType,
  }
  $.cultureBeanRes = await request(functionId, body);
}
//偷营养液大于等于3瓶的好友
//①查询好友列表
async function stealFriendList() {
  const body = {
    pageNum: '1'
  }
  $.stealFriendList = await request('plantFriendList', body);
}

//②执行偷好友营养液的动作
async function collectUserNutr(paradiseUuid) {
  console.log('开始偷好友');
  // console.log(paradiseUuid);
  let functionId = arguments.callee.name.toString();
  const body = {
    "paradiseUuid": paradiseUuid,
    "roundId": currentRoundId
  }
  $.stealFriendRes = await request(functionId, body);
}
async function receiveNutrients() {
  $.receiveNutrientsRes = await request('receiveNutrients', {"roundId": currentRoundId, "monitor_refer": "plant_receiveNutrients"})
  // console.log(`定时领取营养液结果:${JSON.stringify($.receiveNutrientsRes)}`)
}
async function plantEggDoLottery() {
  $.plantEggDoLotteryResult = await requestGet('plantEggDoLottery');
}
//查询天天扭蛋的机会
async function egg() {
  $.plantEggLotteryRes = await requestGet('plantEggLotteryIndex');
}
async function productTaskList() {
  let functionId = arguments.callee.name.toString();
  $.productTaskList = await requestGet(functionId, {"monitor_refer": "plant_productTaskList"});
}
async function plantChannelTaskList() {
  let functionId = arguments.callee.name.toString();
  $.plantChannelTaskList = await requestGet(functionId);
  // console.log('$.plantChannelTaskList', $.plantChannelTaskList)
}
async function shopTaskList() {
  let functionId = arguments.callee.name.toString();
  $.shopTaskListRes = await requestGet(functionId, {"monitor_refer": "plant_receiveNutrients"});
  // console.log('$.shopTaskListRes', $.shopTaskListRes)
}
async function receiveNutrientsTask(awardType) {
  const functionId = arguments.callee.name.toString();
  const body = {
    "monitor_refer": "receiveNutrientsTask",
    "awardType": `${awardType}`,
  }
  $.receiveNutrientsTaskRes = await requestGet(functionId, body);
}
async function plantShareSupportList() {
  $.shareSupportList = await requestGet('plantShareSupportList', {"roundId": ""});
  if ($.shareSupportList && $.shareSupportList.code === '0') {
    const { data } = $.shareSupportList;
    //当日北京时间0点时间戳
    const UTC8_Zero_Time = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    //次日北京时间0点时间戳
    const UTC8_End_Time = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 + (24 * 60 * 60 * 1000);
    let friendList = [];
    data.map(item => {
      if (UTC8_Zero_Time <= item['createTime'] && item['createTime'] < UTC8_End_Time) {
        friendList.push(item);
      }
    })
    message += `【助力您的好友】共${friendList.length}人`;
  } else {
    console.log(`异常情况：${JSON.stringify($.shareSupportList)}`)
  }
}
//助力好友的api
async function helpShare(plantUuid) {
  console.log(`\n开始助力好友: ${plantUuid}`);
  const body = {
    "plantUuid": plantUuid,
    "wxHeadImgUrl": "",
    "shareUuid": "",
    "followType": "1",
  }
  $.helpResult = await request(`plantBeanIndex`, body);
  console.log(`助力结果的code:${$.helpResult && $.helpResult.code}`);
}
async function plantBeanIndex() {
  $.plantBeanIndexResult = await request('plantBeanIndex');//plantBeanIndexBody
}

//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    //const readShareCodeRes = await readShareCode();
    //if (readShareCodeRes && readShareCodeRes.code === 200) {
     // newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    //}
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取种豆得豆配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdPlantBeanShareCodes = $.isNode() ? require('./jdPlantBeanShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(jdPlantBeanShareCodes).forEach((item) => {
        if (jdPlantBeanShareCodes[item]) {
          $.shareCodesArr.push(jdPlantBeanShareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_plantbean_inviter')) $.shareCodesArr = $.getdata('jd_plantbean_inviter').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_plantbean_inviter') ? $.getdata('jd_plantbean_inviter') : '暂无'}\n`);
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify($.shareCodesArr)}`);
    console.log(`您提供了${$.shareCodesArr.length}个账号的种豆得豆助力码\n`);
    resolve()
  })
}
function requestGet(function_id, body = {}) {
  if (!body.version) {
    body["version"] = "9.0.0.1";
  }
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return new Promise(async resolve => {
    await $.wait(2000);
    const option = {
      url: `${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'User-Agent': 'JD4iPhone/167283 (iPhone;iOS 13.6.1;Scale/3.00)',
        'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': "application/x-www-form-urlencoded"
      },
      timeout: 10000,
    };
    $.get(option, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n种豆得豆: API查询请求失败 ‼️‼️')
          $.logErr(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
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
function request(function_id, body = {}){
  return new Promise(async resolve => {
    await $.wait(2000);
    $.post(taskUrl(function_id, body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n种豆得豆: API查询请求失败 ‼️‼️')
          console.log(`function_id:${function_id}`)
          $.logErr(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskUrl(function_id, body) {
  body["version"] = "9.2.4.0";
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&area=19_1601_50258_51885&build=167490&clientVersion=9.3.2`,
    headers: {
      "Cookie": cookie,
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Connection": "keep-alive",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-Hans-CN;q=1,en-CN;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    timeout: 10000,
  }
}
function getParam(url, name) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  const r = url.match(reg)
  if (r != null) return unescape(r[2]);
  return null;
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
