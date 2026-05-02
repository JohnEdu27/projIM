async function addOrder() {
    const name = document.getElementById('name').value;
    const email = document.getElementById("email").value;
    await fetch('http://127.0.0.1:8000/customers',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'},
            body:JSON.stringify({name,email})
        });
        loadOrder();

        async function loadOrder() {
            const res = await
            fetch('http://127.0.0.1:8000/customers');
            const customers = await res.json()
            const list= document.getElementId('Orderlist');
            list.innerHTML = customers.map(b => <li>${b[1]}by${b[2]}</li>).join('');
        }
    loadOrder();
}