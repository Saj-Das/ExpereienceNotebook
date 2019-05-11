import { Injectable } from '@angular/core';
import * as PDFJS from "pdfjs-dist/webpack.js";
import { ToastController, LoadingController } from "@ionic/angular";
import { SQLitePorter } from "@ionic-native/sqlite-porter/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { File } from '@ionic-native/file/ngx';
import { SQLiteObject, SQLite } from "@ionic-native/sqlite/ngx";

@Injectable({
  providedIn: 'root'
})

export class GlobalService {

  test1: any;
  loading: HTMLIonLoadingElement
  formattedData: any;
  msg: string;
  constructor(private sqlite: SQLite,
    private toastController: ToastController, public loadingCtrl: LoadingController,
    private sqlitePorter: SQLitePorter,
    private file: File, private fileChooser: FileChooser, private filePath: FilePath
  ) {
  }
  pdfDocument: PDFJS.PDFDocumentProxy;
  PDFJSViewer = PDFJS;
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  cvparse() {
    try {
      this.fileChooser.open()
        .then(uri => {
          this.filePath.resolveNativePath(uri)
            .then((filePath) => {
              // this.presentToast(filePath);
              var filename = filePath.split('/')
              var dir = '';
              filename.forEach(element => {
                if (element != filename[filename.length - 1]) {
                  if (element != filename[filename.length - 2]) {
                    dir += element + '/'
                  }
                  else {
                    dir += element
                  }

                }
              });
              var filename1 = filename[filename.length - 1]
              this.test1 = dir + "|" + filename1
              this.file.readAsDataURL(dir, filename1)
                .then(x => {
                  this.pdfToText(x);
                }, x => {
                  this.presentToast(x);
                })

            }, (err) => {
              this.presentToast(err);
            })

        })
        .catch(e => {
          this.presentToast(e.message);
        });


    } catch (error) {
      this.presentToast(error.message);
    }

  }
  pdfToText(y) {
    // this.PDFJSViewer.disableTextLayer = true;
    // this.PDFJSViewer.disableWorker = true;
    this.PDFJSViewer.  disableCombineTextItems= true;
    this.PDFJSViewer.getDocument(y).then(pdf => {

      var pdfDocument = pdf;
      var pagesPromises = [];
      this.formattedData = "";
      debugger
      for (var i = 1; i < pdf.numPages + 1; i++) {
        pagesPromises.push(this.getPageText(i, pdfDocument));
      }
      Promise.all(pagesPromises).then(pagesText => {
        pagesText.forEach(element => {
          this.formattedData += element;
        });
        this.presentToast(this.formattedData);
      });
    }, x => {
      this.presentToast("error");
      this.presentToast(x);
    });
  }
  getPageText(pageNum, PDFDocumentInstance) {
    return new Promise((resolve, reject) => {
      PDFDocumentInstance.getPage(pageNum).then(pdfPage => {
        pdfPage.getTextContent().then(textContent => {
          var textItems = textContent.items;
          var finalString = "";
          for (var i = 0; i < textItems.length; i++) {
            var item = textItems[i];
            finalString += item.str + " ";
          }
          resolve(finalString);
        })
      })
    })
  }

  ////export
  exportToSql() {
    this.presentLoading('')
    try {
      this.sqlite.create({
        name: 'ionicdb.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.sqlitePorter.exportDbToSql(db)
          .then((res) => {
            this.export(res);
          })
          .catch(e => this.showmsg(e));
      });
    } catch (error) {
      this.showmsg(error)
    }


  }
  export(sql) {
    let fs = this.file.externalRootDirectory;
    let fileName = "Dump.sql";
    this.file.writeFile(fs, fileName, sql, { replace: true }).then((success) => {
      this.loading.dismiss()
        .then(x => { this.presentToast(" Dump.sql Exported"); }
        );

    }, (error) => {
      this.showmsg(error)
    });
  }
  //import
  importToDb(instance) {
    this.presentLoading('')
    let fs = this.file.externalRootDirectory;
    let fileName = "Dump.sql";
    this.file.readAsText(fs, fileName).then((result) => {
      this.import(result, fs, instance)
    }, (error) => {
      this.showmsg(error)
    });
  }
  import(sql, fs, instance) {
    // this.presentToast(sql)
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.sqlitePorter.importSqlToDb(db, sql)
        .then((data) => {
          this.loading.dismiss()
            .then(x => {
              this.presentToast(" Dump.sql Imported");
              instance.BindData(db);
            });

        })
        .catch(e => this.presentToast(e));
    });

  }
  async presentLoading(msg) {
    if (msg == '') {
      msg = 'Please wait...'
    }
    this.loading = await this.loadingCtrl.create({
      message: msg,
      spinner: 'crescent',
      duration: 2000
    });
    return await this.loading.present();
  }

  showmsg(msg = "Executed SQL") {
    this.msg = msg;
  }
}