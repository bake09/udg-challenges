<template>
  <!-- PageComponent for the entire !!! DYNAMIC !!! handling of 'CSV Verarbeitung' -->
  <q-page class="q-pa-sm">
    <q-table
      dense
      class="my-sticky-virtscroll-table my-sticky-column-table-firstchild my-sticky-column-table-lastchild"
      :title="dateiName"
      :columns="kopf"
      :rows="zeilen"
      row-key="Hauptartikelnr"
      :loading="loadingData"
      :visible-columns="visibleColumns"
      :filter="filter"
      virtual-scroll
      :pagination.sync="pagination"
      v-model:pagination="pagination"
    >
    
    <template v-slot:body-cell-index="props">
      <q-td :props="props" style="background-color: rgb(197 201 208 / 94%)">
          {{ props.row.index }}
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props" style="background-color: rgb(197 201 208 / 94%)">
        <q-btn dense icon="mode_edit" color="grey-9" round flat @click="onEdit(props.row)" size="" />
        <q-btn dense icon="delete" color="red-5" round flat @click="onDelete(props.row)" size=""/>
      </q-td>
    </template>

    <template v-slot:top="props">
      <div class="col-1 q-table__title">{{ dateiName }}</div>
      <q-select
        v-model="visibleColumns"
        multiple
        standout 
        dense
        options-dense
        :display-value="$q.lang.table.columns"
        emit-value
        map-options
        :options="kopf"
        option-value="name"
        style="min-width: 150px"
        class="q-mr-md"
        >
        <template v-slot:append>
          <q-icon :name="visibleColumns.length == kopf.length ? 'visibility' : 'visibility_off'" />
        </template>
      </q-select>
      
      <q-input outlined dense placeholder="Suche" debounce="300" color="primary" v-model="filter">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-space />
      <q-btn dense no-caps color="primary" :disable="loadingData" :label="`${dateiName} hinzufügen`" icon="add" @click="showModal" class="q-mr-md q-px-sm"/>
      <q-btn dense no-caps  @click="exportTable" color="accent" icon="archive" label="CSV Export" class="q-px-sm" />

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
    </q-table>

    <q-dialog v-model="modalOpen" @hide="modalHide">
      <q-card>
        <q-card-section class="row items-center q-py-sm myBgReverse">
          <q-btn icon="close" flat round dense v-close-popup style="opacity:0; user-select:none;pointer-events: none;"/>
          <q-space />
          <div class="text-h6">{{ dateiName }} {{ modalModaltext }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
         <div class="row q-col-gutter-md">
            <q-input
              dense
              class="col-6"
              v-for="(key) in Object.keys(modalFields)" :key="key"
              :label="key"
              outlined
              v-model="modalFields[key]"
              :disable="key == 'index'"
            />
         </div>
        </q-card-section>

        <q-card-actions align="right" class="myBg">
          <q-btn icon="save" label="Speichern" color="green" v-close-popup @click="handleSave"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-card class="row flex justify-between q-pa-md q-mt-md">
      <!-- <div class="col-2">
        <div>Ausgewählte Spalten</div>
        <q-select filled dense v-model="chartField1" :options="initialRawHeaderData" label="Spalte 1" @update:model-value="updateChart()"/>
        <q-select filled dense v-model="chartField2" :options="initialRawHeaderData" label="Spalte 2"  @update:model-value="updateChart()"/>
      </div> -->
      <div class="col-10">
        <apexchart
          ref="realtimeChart"
          v-if="chartDataReady"
          :options="chartOptions"
          :series="series"
          style=" min-width: 100%; height: 50%; max-height: 50%;"
          type="bar"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import Papa from 'papaparse'
import { exportFile } from 'quasar'
import { date } from 'quasar'

export default {
  name: 'PageCSVVerarbeitung',
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      chartDataReady: false,
      series: [],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          stackType: "normal" // gibt prozentuale Darstellung zurück
          // redrawOnWindowResize: false,
          // redrawOnParentResize: false
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        title: {
          text: ""
        },
        xaxis: {
          categories: [],
          labels: {
            formatter: function (val) {
              return val + " Stk."
            }
          }
        },
        yaxis: {
          title: {
            text: undefined
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " Stk."
            }
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40
        }
      },
      kopf: [],
      zeilen: [],
      dateiPfad: "./Artikel.csv",
      loadingData: true,
      pagination: {
        rowsPerPage: 10
      },
      indexOfCurrentylEditing: null,
      filter: '',
      visibleColumns: ['index', 'Hauptartikelnr', 'Artikelname', 'Hersteller', 'Geschlecht', 'Produktart', 'Ärmel', 'Bein', 'Kragen', 'Taschenart', 'Grammatur', 'Material', 'Bildname', 'actions'],
      initialRawHeaderData: [],
      modalFields: {},
      modalOpen: false,
      modalMode: "add",
      chartField1: 'Geschlecht',
      chartField2: 'Produktart',
      selectOptions: [],
      selectedOption1: '',
      selectedOption2: '',
    }
  },
  computed: {
    /*
      dateiName = returns filename 
    */
    dateiName(){
      return this.dateiPfad.split('/')[1].split('.')[0]
    },
    /*
      modalModaltext = returns helper for the one and only Modal. - bearbeiten, hinzufügen 
    */
    modalModaltext() {
      if(this.modalMode == "add") return "hinzufügen"
      return "bearbeiten"
    },
    geschlecht(){
      return ['index', 'Hauptartikelnr', 'Artikelname', 'Hersteller', 'Beschreibung', 'Materialangaben', 'Geschlecht', 'Produktart', 'Ärmel', 'Bein', 'Kragen', 'Herstellung', 'Taschenart', 'Grammatur', 'Material', 'Ursprungsland', 'Bildname', 'actions']
      
    },
    chartHeading() {
      return this.chartField2 + ' nach ' + this.chartField1
    }
  },
  mounted() {
    this.loadCSV()
  },
  methods: {
    myMethod() {
      console.log("object");
    },
    loadCSV() {

      this.loadingData = true
      
      Papa.parse(this.dateiPfad, {
        header: false,
        download: true,
        complete: results => {
      
            this.loadingData = false

            // 1. Create index column
            let index = {
              name: 'index',
              label: '#',
              field: 'index',
              align: 'right',
              sortable: true 
            }

            // 2. create actions column
            let aktionen = { 
              name: 'actions', 
              label: 'Aktionenen',
              align: 'right', 
              label: 'Aktionen' 
            }

            // 3. assign created structure to header (kopf)
            this.kopf = this.createHeader(results.data)
            this.kopf.unshift(index)
            this.kopf.push(aktionen)

            // 3. assign created structure to columns (zeilen)
            this.initialRawHeaderData = results.data[0]
            this.zeilen = this.createRows(this.initialRawHeaderData, results.data)
            this.initialFieldsSchema()
            this.chartDataReady = true

            // 4. run updateChart to draw the dynamic Chart
            this.updateChart()

        }
      })
    },
    initialFieldsSchema() { 
      // Create Table Header from CSV. this will used for creating the Chart
      let arrayData = this.initialRawHeaderData

      const obje = {};

      for (const key of arrayData) {
            obje[key] = "";
      }
      Object.assign(this.modalFields, obje)
    },
    createHeader(obj) {
      let arrayData = obj[0]
      return Object.keys(arrayData).map((key) => { 
        return {
          name: arrayData[key], 
          label: arrayData[key], 
          field: arrayData[key], 
          align: 'left',
          sortable: true 
        }; 
      })
    },
    createRows(header, rows){
      rows.splice(1).map((rowitem, inde) => {
        this.zeilen.push(Object.assign.apply({}, header.map( (val, ind) => ( {[val]: rowitem[ind], index: inde+1} ) ) ))
      })
      return this.zeilen
    },
    handleSave() {
      
      let maxIndex = 1
      if(this.zeilen.length){
        maxIndex = Math.max(...this.zeilen.map(el=>el.index))+1
      }

      if(this.modalFields["index"] == undefined){
        this.modalFields["index"] = maxIndex
        const objCopy = JSON.parse(JSON.stringify(this.modalFields));
        this.zeilen.push(objCopy)
      }else{
        
        const objCopy = JSON.parse(JSON.stringify(this.modalFields));
        Object.assign(this.zeilen[this.indexOfCurrentylEditing], objCopy)
      }

    },
    showModal() {
      // Clear index if provided (can be filled if Modal has been used previously for editing)
      if(this.modalFields["index"] != undefined){
        delete this.modalFields["index"]
      }
      this.initialFieldsSchema()
      this.indexOfCurrentylEditing = null
      this.modalMode = 'add'
      this.modalOpen = true
    },
    modalHide() {
      // Update the Chart-View
      this.updateChart()
    },
    onEdit(item){
      this.modalMode = 'edit'
      this.modalOpen = true
      this.indexOfCurrentylEditing = this.zeilen.findIndex(el => el.index == item.index)
      // let obj = {}
      // obj = item
      // Object.assign(this.modalFields, obj)
      const objCopy = JSON.parse(JSON.stringify(item));
      Object.assign(this.modalFields, objCopy)

    },
    onDelete(item){

        this.$q.dialog({
          title: 'Bitte bestätigen',
          message: `<span class="text-italic">${this.dateiName}</span> <span class="text-bold">Nr.:${item.index}</span> wirklich <span class="text-red">löschen?</span>`,
          cancel: true,
          persistent: true,
          html: true
        }).onOk(() => {
          let indexToDelete = this.zeilen.findIndex(el => el.index == item.index)
          this.zeilen.splice(indexToDelete,1)
          this.updateChart()
        })
    },
    wrapCsvValue(val, formatFn) {
      let formatted = formatFn !== void 0
        ? formatFn(val)
        : val

      formatted = formatted === void 0 || formatted === null
        ? ''
        : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    },
    exportTable() {
      // 1. removing Index and actions column
      let kopfToIterate = JSON.parse(JSON.stringify(this.kopf)).slice(1, this.kopf.length-1)

      let content = [kopfToIterate.map(col => this.wrapCsvValue(col.label))].concat(
        this.zeilen.map(row => kopfToIterate.map(col => this.wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[ col.field === void 0 ? col.name : col.field ],
          col.format
        )).join(','))
      ).join('\r\n')

      // 2. IMPORTANT! replace all commas with a semicolon (without replacing commas inside any column)
      content = content.replace(/",/g, '";');

      // 3. create dynamic Filename for the export
      let timeStamp = Date.now()
      let formattedString = date.formatDate(timeStamp, 'DD_MM_YYYY_HH_mm_ss')
      let filename = `${this.dateiName}_${formattedString}`

      // 4. run exportFile method
      const status = exportFile(
        filename,
        content,
        'text/csv'
      )

      // 5. if export fails run Warning Modal
      if (status !== true) {
        $q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    updateChart() {
      console.clear()
      
      // 1. Create firstDataArray from selectedField11
      let firstDataArray = this.zeilen.reduce((array, item) => {
          if(array.indexOf(item[this.chartField1]) === -1) {
            array.push(item[this.chartField1]) 
          }
          return array
      },[])
      this.selectOptions = firstDataArray

      // 2. Set categories Array from FirstDataArray
      let resultfirstDataArray = firstDataArray.map(item => {
        if(item == ""){
          item = "'leer'"
        }
        return item
      })
      this.chartOptions.xaxis.categories = resultfirstDataArray
      // 2.1 [optional] setting empty Fields to 'leer' uncomment to use and override

      // setting blank items to 'leer'
      // firstDataArray = firstDataArray.map(item => {
      //   if(item == ""){
      //     item = "'leer'"
      //   }
      //   return item
      // });
      
      // 3. Set Chart-Heading from selectedFields
      this.chartOptions.title.text = this.chartHeading


      // 4. Create secondDataArray from selectedField2
      let secondDataArray = this.zeilen.reduce((array, item) => {
          if(array.indexOf(item[this.chartField2]) === -1) {
            array.push(item[this.chartField2])
          }
          return array
      },[]);

      // 5. Create ReadyToPushObjects from secondaryDataArray
      let createdObj = secondDataArray.map(item => {
        let obj = {}
        obj["name"] = item
        obj["data"] = []
        return obj
      })

      // 6. Create Array ReadyToCopy To chart-series
      let meinArray = createdObj.reduce((array, item) => {
        array.push(item)
        return array
      },[])

      // 7. Copy/Update created Elements to charts Options
      this.series = meinArray 


      // 8. Create Empty array to populate with ReadCounts of each Selection
      let ergebniss = []

      // 9. Loop/Iterate each Items from secondDataArray
      secondDataArray.forEach(item => {

        let tshirtsHerren = null

        firstDataArray.forEach(item2 => {
          
          tshirtsHerren = this.zeilen.reduce((count, item3) => {
            if(item3.Produktart == item && item3.Geschlecht == item2){
              count++
            }
            return count
          }, 0)

          ergebniss.push(tshirtsHerren)
          return tshirtsHerren
        })
        
      })

      // 10. Helper-Function to evenly split the result to own arrays
      function grouper(array, cols) {
        function split(array, cols) {
            if (cols==1) return array
            let size = Math.ceil(array.length / cols)
            return array.slice(0, size).concat([null]).concat(split(array.slice(size), cols-1))
        }

        let a = split(array, cols)
        let groups = []
        let group = []
        for(let i = 0; i < a.length; i++) {
            if (a[i] === null) {
                groups.push(group)
                group = []
                continue
            }
            group.push(a[i])
            
        }
        groups.push(group)
        return groups
      }

      // 11. assign to variable = 'grouped' evenly splitet the results arrays
      let grouped =  grouper(ergebniss, secondDataArray.length);
      
      // 12. assign Each grouped array counts to data property of the objects
      meinArray.forEach((item, index) => {
        item["data"] = grouped[index]
      })

    }
  }
}
</script>

<style lang="sass">
.q-table--dense .q-table td:last-child
  padding-right: 0px
  padding-left: 0px

tr:nth-child(even)
  background-color: #3498db0d

thead tr:first-child
  z-index: 3

.myBg
  background: linear-gradient(180deg, rgb(36 50 63 / 40%) 0%, rgba(16, 92, 128, 0.51) 100%)
.myBgReverse
  background: linear-gradient(0deg, rgb(36 50 63 / 40%) 0%, rgba(16, 92, 128, 0.51) 100%)

.my-sticky-virtscroll-table
  /* height or max-height is important */
  height: 40vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:last-child th
    top: 48px
  thead tr:first-child th
    top: 0

.my-sticky-column-table-firstchild
  max-width: 100%

  thead tr:first-child th:first-child
    background-color: #fff
    z-index: 3

  td:first-child
    // background-color: rgb(197 201 208 / 94%)

  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 1

.my-sticky-column-table-lastchild
  max-width: 100%

  thead tr:last-child th:last-child
    /* bg color is important for th; just specify one */
    background-color: #fff
    z-index: 3

  td:last-child
    // background-color: rgb(197 201 208 / 94%)

  th:last-child,
  td:last-child
    position: sticky
    right: 0
    // z-index: 1
</style>