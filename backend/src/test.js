fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: 'I have these blocks of free time, 10am-12pm, 1pm-4pm, 5pm-7pm. I want to do these activities, Job hunt (high priority) Grocery shop (high priority),Do easy exercise (medium priority) ,Read (low priority), Write (high priority),Draw (high priority), Swim (high priority), Bake cake (low priority) Please build a schedule for me, be realistic, tasks can be dropped if time is insufficient.'})
})
.then(response => response.json())
// .then(data => {
//     console.log(JSON.stringify(data, null, 2)) // print everything
// })
.then(data => {console.log(data[0])})
// .then(data => {
//     console.log(data.schedule[0].activities) // first time block's activities
// })
