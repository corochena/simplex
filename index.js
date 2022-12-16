input_constraints = document.querySelector('#constraints')
input_variables = document.querySelector('#variables')

tablaHtml = document.querySelector('#tableau')

input_constraints.addEventListener('keyup', makeTable)
input_variables.addEventListener('keyup', makeTable)

document.querySelector('button').addEventListener('click', readData)

function printtable(tabla) {
  nodotabla = document.createElement('table')
  for (let row of tabla) {
    tr = document.createElement('tr')
    for (let val of row) {
      td = document.createElement('td')
      td.appendChild(document.createTextNode(Number(val).toFixed(3)))
      tr.appendChild(td)
    }
    nodotabla.appendChild(tr)
  }
  return nodotabla
}

function loadtest() {
  let test = [
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 10],
    [500, 700, 600, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 7000],
    [0, 0, 0, 0, 500, 700, 600, 400, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 9000],
    [0, 0, 0, 0, 0, 0, 0, 0, 500, 700, 600, 400, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5000],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 20],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 16],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 25],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 13],
    [-320, -400, -360, -290, -320, -400, -360, -290, -320, -400, -360, -290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
  ]
  let test2 = [
    [2,2,1.5,1,1,0,0,0,180],
    [2,2.5,2,1.5,0,1,0,0,230],
    [4,2,6,4,0,0,1,0,480],
    [-5,-6.5,-5,-5.5,0,0,0,1,0]
  ]
  let nfilas = test.length
  let ncols = test[0].length
  input_constraints.value = nfilas - 1
  input_variables.value = ncols - nfilas - 1
  input_constraints.dispatchEvent(new Event('keyup'))
  
  inputs = tablaHtml.querySelectorAll("input")
  let i = 0
  let j = 0
  for (node of inputs) {
    node.value = test[i][j]
    j++
    if (j == ncols) {
      j = 0
      i++
    }
  }
}

loadtest()

function solver(tabla_simplex) {
  let tablas = [tabla_simplex]
  
  while (tabla_simplex.at(-1).some(elem => elem < 0)) {
    pivotcolidx = colpivote(tabla_simplex)
    pivotrowidx = filapivote(tabla_simplex, pivotcolidx)
    tabla_simplex = newtable(tabla_simplex, pivotrowidx, pivotcolidx)
    tablas.push(tabla_simplex)
  }
  
  document.querySelector('#solution').appendChild(printtable(tabla_simplex))
}

function newtable(tabla, pivotrowidx, pivotcolidx) {
  let newarray = []
  let n = tabla.length
  let m = tabla[0].length
  let pivotelem = tabla[pivotrowidx][pivotcolidx]

  for (let i=0; i<n; i++) {
    newarray.push([])
    if (i==pivotrowidx) {
      for (let j=0; j<m; j++) {
        newarray[i].push(tabla[i][j] / pivotelem)
      }
    }
    else {
      for (let j=0; j<m; j++) {
        let valor = tabla[i][j] - tabla[pivotrowidx][j] / pivotelem * tabla[i][pivotcolidx]
        newarray[i].push(valor)
      }
    }
  }
  return newarray
}

function filapivote(tabla, idx) {
  let ld = tabla.map(row => row.at(-1))
  let pivotcol = tabla.map(row => row.at(idx))
  let n = ld.length
  let cocientes = []
  for (let i=0; i<n; i++) {
    if (pivotcol[i] != 0) cocientes.push(ld[i] / pivotcol[i])
    else cocientes.push(0)
  }
  let maxval = Math.min(...cocientes.filter(num => num > 0))
  return cocientes.indexOf(maxval)
}

function colpivote(tabla) {
  let lastrow = tabla.at(-1)
  let idx = 0
  for (let i in lastrow) {
    if (lastrow[i] < lastrow[idx]) {
      idx = i
    }
  }
  return idx // or Number(idx)
}

function readData() {
  nconstraints = +input_constraints.value
  nvariables = +input_variables.value
  nrows = nconstraints + 1 // agregamos 1 fila para la funcion objetivo Z
  ncols = nvariables + nrows + 1 // agregamos 1 columna para el lado derecho LD
  
  tabla_array = []
  inputs = tablaHtml.querySelectorAll("input")
  counter = 0
  for (node of inputs) {
    if (counter == 0) tabla_array.push([])
    tabla_array[tabla_array.length - 1].push(+node.value)
    counter++
    if (counter == ncols) counter = 0
  }
  solver(tabla_array) 
}

function makeTable() {
  
  while (tablaHtml.firstChild) {
    tablaHtml.removeChild(tablaHtml.firstChild)
  }
  
  nconstraints = +input_constraints.value
  nvariables = +input_variables.value
  nrows = nconstraints + 1 // agregamos 1 fila para la funcion objetivo Z
  ncols = nvariables + nrows + 1 // agregamos 1 columna para el lado derecho LD
  
  for (let i=0; i<nrows+1; i++) {
    tr = document.createElement('tr')
    for (let j=0; j<ncols+1; j++) {
      td = document.createElement('td')
      if (i==0) {
        if (j == 0) label = ""
        else if (j < nvariables + 1) label = "X" + j
        else if (j == ncols - 1) label = "Z"
        else if (j == ncols) label = "LD"
        else label = "S" + (j-nvariables)
        
        textNode = document.createTextNode(label)
        td.appendChild(textNode)
      } 
      else {
        if (j == 0) {
          if (i == nrows) label = "Z"
          else label = "R" + i
          
          textNode = document.createTextNode(label)
          td.appendChild(textNode)
        }
        else {
          inputElem = document.createElement('input')
          td.appendChild(inputElem)
        }
      }
      tr.appendChild(td)
    }
    tablaHtml.appendChild(tr)
  }
}