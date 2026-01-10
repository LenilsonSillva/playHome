export function OnlineImpostorGame() {
  //   useEffect(() => {
  //       const socket = connectSocket()
  //       socket.onmessage = event => {
  //         const data = JSON.parse(event.data)
  //         switch (data.type) {
  //           case 'ROOM_CREATED':
  //           case 'ROOM_UPDATE':
  //             setRoom(data.room)
  //             if (data.playerId) {
  //               setPlayerId(data.playerId)
  //             }
  //             break
  //         }
  //       }
  //     }, [])
  //     function createRoom() {
  //       const socket = connectSocket()
  //       socket.send(
  //         JSON.stringify({
  //           type: 'CREATE_ROOM',
  //           roomId,
  //           name,
  //         })
  //       )
  //     }
  //     function joinRoom() {
  //       const socket = connectSocket()
  //       socket.send(
  //         JSON.stringify({
  //           type: 'JOIN_ROOM',
  //           roomId,
  //           name,
  //         })
  //       )
  //     }
  //     function startGame() {
  //       const socket = connectSocket()
  //       socket.send(
  //         JSON.stringify({
  //           type: 'START_GAME',
  //           roomId,
  //         })
  //       )
  //     }

  return <div>Online Impostor Game</div>;
}
