
window.addEventListener('load', () => {
  const token = localStorage.getItem('jwtToken');
  if (token && window.location.pathname.includes("auth.html")) {
    window.location.href = "Van.html";
  }
});

// Show message on auth page had to use claudeai to help
function showMessage(message, type = 'info') {
  const messagesDiv = $('#messages');
  messagesDiv.html(`
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `);
  setTimeout(() => {
    messagesDiv.html('');
  }, 5000);
}

// Register new user 
$('#registerForm').on('submit', async (e) => {
  e.preventDefault();
  
  const username = $('#registerUsername').val();
  const password = $('#registerPassword').val();
//had to use ai to help with this part
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    
    if (response.ok) {
      showMessage(`Account created successfully! You can now login.`, 'success');
      $('#registerForm')[0].reset();
      $('#login-tab').tab('show');
    } else {
      showMessage(`Registration failed: ${result.error}`, 'danger');
    }
  } catch (error) {
    showMessage(`Network error: ${error.message}`, 'danger');
  }
});

// Login user
$('#loginForm').on('submit', async (e) => {
  e.preventDefault();
  
  const username = $('#loginUsername').val();
  const password = $('#loginPassword').val();

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    //Needed help with ai on this part
    if (response.ok) {
      localStorage.setItem('jwtToken', result.token);
      localStorage.setItem('username', result.user.username);
      showMessage(`Login successful! Welcome, ${result.user.username}!`, 'success');
      setTimeout(() => {
        window.location.href = "Van.html";
      }, 1500);
    } else {
      showMessage(`Login failed: ${result.error}`, 'danger');
    }
  } catch (error) {
    showMessage(`Network error: ${error.message}`, 'danger');
  }
});


let editingShoeId = null;

// Auth from payload 
if (window.location.pathname.includes("Van.html")) {
  window.addEventListener('load', () => {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    
    if (!token) {
      window.location.href = "auth.html";
      return;
    }
    
    if (username) {
      $('#currentUsername').text(username);
    }

    loadShoes();
  });
}

function getAuthHeaders() {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    alert('Session expired. Please login again.');
    logout();
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('username');
  window.location.href = "auth.html";
}

// Fetch and display all shoes
async function loadShoes() {
  try {
    const res = await fetch('/api/shoes', {
      headers: getAuthHeaders()
    });
    if (handleAuthError(res)) return;
    const data = await res.json();
    displayShoes(data);
  } catch (error) {
    console.error('Error loading shoes:', error);
  }
}

function displayShoes(shoes) {
  const list = $('#shoesList');
  list.empty();
  shoes.forEach(shoe => {
    const li = $(`
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${shoe.name} (${shoe.gender}, Size: ${shoe.size})</span>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2 edit-btn">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </li>
    `);
//Needed help with ai on this part
    li.find('.delete-btn').click(async () => {
      try {
        const res = await fetch(`/api/body/${shoe._id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (handleAuthError(res)) return;
        loadShoes();
      } catch (error) {
        console.error('Error deleting shoe:', error);
      }
    });

    li.find('.edit-btn').click(() => {
      editingShoeId = shoe._id;
      $('#bodyName').val(shoe.name);
      $('#bodyGender').val(shoe.gender);
      $('#bodySize').val(shoe.size);
      $('#submitBtn').text('Update Shoe').removeClass('btn-success').addClass('btn-warning');
      $('#bodyResult').text('Editing mode...');
    });

    list.append(li);
  });
}

async function addShoe() {
  const name = $('#bodyName').val();
  const gender = $('#bodyGender').val();
  const size = Number($('#bodySize').val());
  if (!name || !gender || !size) return alert('Fill in all fields');

  try {
    let res;
    if (editingShoeId) {
      res = await fetch(`/api/body/${editingShoeId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, gender, size })
      });
    } else {
      res = await fetch('/api/body', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, gender, size })
      });
    }

    if (handleAuthError(res)) return;
    const data = await res.json();
    $('#bodyResult').text(data.message || 'Success');
    $('#bodyName').val('');
    $('#bodyGender').val('Women');
    $('#bodySize').val('');
    $('#submitBtn').text('Add Shoe').removeClass('btn-warning').addClass('btn-success');
    editingShoeId = null;
    loadShoes();
  } catch (error) {
    console.error('Error adding/updating shoe:', error);
  }
}

// API greeting 
if (window.location.pathname.includes("Van.html")) {
  fetch('/api/Van', {
    headers: getAuthHeaders()
  })
    .then(res => {
      if (handleAuthError(res)) return;
      return res.json();
    })
    .then(data => {
      if (data) $('#apiGreeting').html(`<h5>API says: ${data.myVar}</h5>`);
    })
    .catch(() => $('#apiGreeting').html('<h5 class="text-danger">Error fetching API</h5>'));
}
