//Phonevr p2p negotiation server

var rooms=[];

//Impl
var p2p=(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    res.statusCode=200;
    req.on('data',body=>{
        body=JSON.parse(body);
        var room = rooms.find(x=>x.id===body.roomId);
        if(!room){
            room = {
                peers:[],
                id:body.roomId,
                lastUpdatedTime:Date.now()
            };
            rooms.push(room);
            console.log("adding room: "+body.roomId);
        }
        room.lastUpdatedTime=Date.now(); 
        var peer=room.peers.find(x=>x.id===body.id);
        //if a new peer, add it
        if(!peer) {  
            peer=room.peers[room.peers.push({id:body.id, offersFor:[], answersFor:[], candidates:[] })-1]; 
        }

        if(body.description)peer.description=body.description;
        if(body.canComputeHands)peer.canComputeHands=body.canComputeHands;
        if(body.offerFor){ 
            var p=room.peers.find(x=>x.id===body.offerFor);
            if(p && body.offer){
                p.offersFor.push(body.offer);
            }
        }
        if(body.answerFor){ 
            var p=room.peers.find(x=>x.id===body.answerFor);
            if(p && body.answer){
                p.answersFor.push(body.answer);
            }
        }
        if(body.candidateFor){ 
            var p=room.peers.find(x=>x.id===body.candidateFor);
            if(p && body.candidate){
                p.candidates.push(body.candidate);
            }
        }

        res.write(JSON.stringify(room));
        res.end();
        
        if(peer.offersFor.length>0)console.log("offer for peer: "+peer.id);
        if(peer.candidates.length>0)console.log("candidate for peer: "+peer.id);

        //after sending the handshakes, clear them
        peer.offersFor=[];
        peer.answersFor=[];
        peer.candidates=[];
    });
}

//delet rooms >4 hrs old
setInterval(() => {
    for(var i=0;i<rooms.length;i++){
        var r=rooms[i];
            if(r.lastUpdatedTime<=Date.now()-31550400){
                rooms=rooms.splice(i,1);
                i--;
            }
        }
}, 10000);
//activity log
setInterval(() => {
    console.log(Date.now()+": there are "+rooms.length+" rooms.");
}, 3600000);
module.exports={p2p:p2p};