import { date } from 'quasar'

export default {
  namespaced: true,
  state: {
    canvas: null,
    ctx: null,
    canvasWidthAndHeight: 300,
    isDrawing: false,
    fillArray: [],
    selectedPaintTool: 'brush',
    selectedColor: 'black',
    colorOptions: ['black', 'grey', 'brown', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'white'],
    selectedGrid: '8x8',
    gridOptions: [
      '8x8', '12x12', '16x16', '32x32'
    ]
  },
  getters: {
    getSelectedGrid(state){
      return state.selectedGrid
    },
    getGridOptions(state){
      return state.gridOptions
    },
    getSelectedPaintTool(state){
      return state.selectedPaintTool
    },
    getSelectedColor(state){
      return state.selectedColor
    },
    getColorOptions(state){
      return state.colorOptions
    },
    getIsDrawing(state){
      return state.isDrawing
    },
    getCanvasWidthAndHeight(state){
      return state.canvasWidthAndHeight
    },
    returnRowAndCellsQuantity(state){
      return parseInt(state.selectedGrid.split("x")[0])
    },
    returnCellSize(state, getters){
      return state.canvasWidthAndHeight/getters.returnRowAndCellsQuantity
    },
    canvas(state){
      return state.canvas
    },
    ctx(state){
      return state.ctx
    },
    fillArray(state){
      return state.fillArray
    }
  },
  mutations: {
    setSelectedGrid(state, newValue){
      state.selectedGrid = newValue
    },
    setSelectedPaintTool(state, newValue){
      state.selectedPaintTool = newValue
    },
    setSelectedColor(state, newValue){
      state.selectedColor = newValue
    },
    setIsDrawing(state, newValue){
      state.isDrawing = newValue
    },
    createCanvasReference(state, newValue){
      state.canvas = newValue
      state.ctx = state.canvas.getContext("2d")
      state.canvas.width = state.canvasWidthAndHeight
      state.canvas.height = state.canvasWidthAndHeight
    },
    createInitialEmptyFillArray(state, {getters}){
      // Empty existing Array
      if(state.fillArray.length){ 
        state.fillArray = []
      }
      // Populate Array initially
      for(let i = 0; i < getters.returnRowAndCellsQuantity; i++){
        let cellsArray = []
        for(let j = 0; j < getters.returnRowAndCellsQuantity; j++){
          cellsArray.push('white')
        }
        state.fillArray.push(cellsArray)
      }
    },
    setCanvas(state, newValue){
      state.canvas = newValue
    },
    setCtx(state, newValue){
      state.ctx = newValue
    },
    setFillArray(state, newValue){
      state.fillArray = newValue
    },
    setClearCanvas(state){
      state.ctx = state.ctx.clearRect(0, 0, state.getCanvasWidthAndHeight, state.getCanvasWidthAndHeight);
      state.ctx = state.canvas.getContext("2d")
    },
    setDrawInitialCanvasByGivenGridSelection(state, {getters}){
      for(let row = 0; row < getters.returnRowAndCellsQuantity; row++)
      {
        for(let col = 0; col < getters.returnRowAndCellsQuantity; col++)
        {
          let x = col * getters.returnCellSize;
          let y = row * getters.returnCellSize;

          state.ctx.fillStyle = 'rgba(255,255,255,1)'
          state.ctx.fillRect(x, y, getters.returnCellSize, getters.returnCellSize)
        }
      }
    },
    setHandleDraw(state, {layerX, layerY, eventtype, getters}){
      if(state.isDrawing){
        const row = Math.floor( layerY / getters.returnCellSize )
        const col = Math.floor( layerX / getters.returnCellSize )

        const x = col * getters.returnCellSize
        const y = row * getters.returnCellSize

        let rowIndex =  y/getters.returnCellSize
        let cellIndex = x/getters.returnCellSize

        if(state.selectedPaintTool == "brush"){
          state.fillArray[rowIndex][cellIndex] = state.selectedColor
          // this.fillSingleCell(x, y, state.selectedColor)
          this.commit('pixel/setFillSingleCell', x, y, state.selectedColor)
        }else{
          if(this.fillArray[rowIndex][cellIndex] != state.selectedColor){
            // this.performFloodFill(row, col, state.fillArray[rowIndex][cellIndex], state.selectedColor)
            this.commit('pixel/setPerformFloodFil', row, col, state.fillArray[rowIndex][cellIndex], state.selectedColor)
            // Update View by calling Fill-Stack
            setTimeout(() => {
              // this.drawEntireCanvasByArray()
              this.commit('pixel/setDrawEntireCanvasByArray')
              
            }, 30);
          }
        }
      }
    },
    setHandleDrawByClick(state, {getters}, e){
      if(state.isDrawing){
        const row = Math.floor( e.layerY / getters.returnCellSize )
        const col = Math.floor( e.layerX / getters.returnCellSize )

        const x = col * getters.returnCellSize
        const y = row * getters.returnCellSize

        let rowIndex =  y/getters.returnCellSize
        let cellIndex = x/getters.returnCellSize

        if(state.selectedPaintTool == "brush"){
          this.fillArray[rowIndex][cellIndex] = state.selectedColor
          this.fillSingleCell(x, y, state.selectedColor)
        }else{
          if(state.fillArray[rowIndex][cellIndex] != stata.selectedColor){
            this.performFloodFill(row, col, state.fillArray[rowIndex][cellIndex], state.selectedColor)
            // Update View by calling Fill-Stack
            setTimeout(() => {
              this.drawEntireCanvasByArray()
            }, 30);
          }
        }
      }
    },
    setFillSingleCell(state, {getters}, x, y, color){
      state.ctx.fillStyle = color
      state.ctx.fillRect(x, y  , getters.returnCellSize, getters.returnCellSize)
    },
    setDrawEntireCanvasByArray(state, {getters}){
      // let testArray = [
      //   ['black', 'red', 'black', 'red', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white',],
      //   ['white', 'white', 'white', 'white', 'white', 'white', 'blue', 'blue',]
      // ]
      
      // Draw entire Array with cell Position Faktor(canvas.length/Count of Cells)
      let posFaktor = state.getCanvasWidthAndHeight / getters.returnRowAndCellsQuantity

      for(let row = 0; row < getters.returnRowAndCellsQuantity; row++){
        for(let cell = 0; cell < getters.returnRowAndCellsQuantity; cell++){
          this.fillSingleCell(row * posFaktor, cell * posFaktor, state.fillArray[cell][row])
          // this.fillSingleCell(row * posFaktor, cell * posFaktor, testArray[cell][row])
        }
      }
    },
    setPerformFloodFil(state, i, j, oldColor, newColor){

      // https://www.codeguru.co.in/2021/10/flood-fill-algorithm-in-javascript.html

      // const map = [
      //   ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '#', '-', '-', '-', '-', '#'],
      //   ['#', '#', '#', '-', '-', '-', '#', '#', '#'],
      //   ['#', '-', '-', '-', '-', '#', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '-', '-', '-', '#', '-', '-', '-', '#'],
      //   ['#', '#', '#', '#', '#', '#', '#', '#', '#'],
      // ];

      // Check the boundary condition
      if (i < 0 || i >= state.fillArray.length || j < 0 || j >= state.fillArray[i].length) return;
      if (state.fillArray[i][j] !== oldColor) return;

      // set the color of node to newColor
      state.fillArray[i][j] = newColor;

      // Look for neighboring cell
      state.performFloodFill(i + 1, j, oldColor, newColor);
      state.performFloodFill(i - 1, j, oldColor, newColor);
      state.performFloodFill(i, j + 1, oldColor, newColor);
      state.performFloodFill(i, j - 1, oldColor, newColor);
    },
  },
  actions: {
    setSelectedGrid({ commit }, newValue){
      commit("setSelectedGrid", newValue);
    },
    setSelectedPaintTool({ commit }, newValue){
      commit("setSelectedPaintTool", newValue);
    },
    setSelectedColor({ commit }, newValue){
      commit("setSelectedColor", newValue);
    },
    setIsDrawing({ commit }, newValue){
      commit("setIsDrawing", newValue);
    },
    createCanvasReference({ commit }, newValue){
      commit("createCanvasReference", newValue);
    },
    createInitialEmptyFillArray({ commit, getters }){
      commit("createInitialEmptyFillArray", {getters});
    },
    setCanvas({ commit }, newValue){
      commit("setCanvas", newValue);
    },
    setCtx({ commit }, newValue){
      commit("setCtx", newValue);
    },
    setFillArray({ commit }, newValue){
      commit("setFillArray", newValue);
    },
    setClearCanvas({ commit }){
      commit("setClearCanvas");
    },
    setDrawInitialCanvasByGivenGridSelection({ commit, getters }){
      commit("setDrawInitialCanvasByGivenGridSelection", {getters});
    },
    setHandleDraw({ commit, getters }, layerX, layerY, eventtype){
      commit("setHandleDraw", layerX, layerY, eventtype, {getters});
    },
    setHandleDrawByClick({ commit, getters }, e){
      commit("setHandleDrawByClick", {getters}, e);
    },
    setFillSingleCell({commit, getters}, x, y, color){
      commit("setFillSingleCell", {getters}, x, y, color)
    },
    setDrawEntireCanvasByArray({commit, getters}){
      commit("setDrawEntireCanvasByArray", {getters})
    },
    setPerformFloodFil({commit},i, j, oldColor, newColor){
      commit("setPerformFloodFil", i, j, oldColor, newColor)
    },
  }
}
