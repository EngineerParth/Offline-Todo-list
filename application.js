(function () {
    //Global variable to store reference to database
    var db, input, ul;

    databaseOpen(function () {
        input = document.querySelector('input');
        document.body.addEventListener('submit', onSubmit);
        document.body.addEventListener('click', onClick)
        databaseTodosGet(renderAllTodos); //argumet is the function to be executed when the call returns
        alert("The database has been opened.");
    });

    function onClick(e){
        if(e.target.hasAttribute('id')){
            databaseTodosDelete(parseInt(e.target.getAttribute('id'),10),function(){
                databaseTodosGet(renderAllTodos);
            });
        }
    }

    function onSubmit(e) {
        e.preventDefault();
        if(!input.value.euqals('')){
            databaseTodosAdd(input.value, function () {
                databaseTodosGet(renderAllTodos);
                input.value = '';
            });
        }
    }

    function databaseOpen(callback) {

        //Open the database, specify name and version
        var version = 1;
        var request = indexedDB.open('todos', version);

        request.onupgradeneeded = function (e) {
            db = e.target.result;
            e.target.transaction.onerror = databaseError;
            db.createObjectStore('todo', { keyPath: 'timeStamp' });
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            callback();
        };

        request.onerror = databaseError;
    }

    function databaseTodosAdd(text, callback) {
        var transaction = db.transaction(['todo'], 'readwrite');
        var store = transaction.objectStore('todo');
        var request = store.put({
            text: text,
            timeStamp: Date.now()
        });

        transaction.oncomplete = function (e) {
            callback();
        };

        request.onerror = databaseError;
    }

    function databaseTodosGet(callback) {
        var transaction = db.transaction(['todo'], 'readonly');
        var store = transaction.objectStore('todo');

        //get everything in the store
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        var data = [];

        cursorRequest.onsuccess = function (e) {
            var result = e.target.result;

            if (result) {
                data.push(result.value);
                 result.continue();
            } else {
                callback(data);
            }
        };
    }

    function renderAllTodos(todos){
        var html = '';
        todos.forEach(function(todo){
            html += todoToHtml(todo);
        });
        var list = document.querySelector('ul');
        list.innerHTML = html;
    }

    function databaseTodosDelete(id, callback){
        var transaction = db.transaction(['todo'], 'readwrite');
        var store = transaction.objectStore('todo');
        var request = store.delete(id);
        transaction.oncomplete=function(e){
            callback();
        };

        request.onerror = databaseError;
    }

   function todoToHtml(todo) {
        return '<li id="'+todo.timeStamp+'">'+todo.text+'</li>';
   }

    function databaseError(e) {
        console.log("An indexedDB error has occured", e);
    };
} ());
