const LINE_BREAK = "\r\n";
export default class Exporter {
    csv(data: Array<object | string | number> | object) {
        let convertToString = (d: Array<object | string | number> | object) => {
            var output = "";
            if (d instanceof Array) {
                let hasWrittenColumn = false;
                d.forEach((datum) => {
                    let row = "";
                    if (typeof datum === "object") {
                        let attributes = Object.keys(datum);
                        if (!hasWrittenColumn) {
                            output += attributes.join(",") + LINE_BREAK;
                            hasWrittenColumn = true;
                        }

                        attributes.forEach((attribute, i) => {
                            row += datum[attribute];
                            if (i !== attributes.length - 1) {
                                row += ",";
                            }
                        });
                    } else {
                        row = datum.toString();
                    }
                    output += row + LINE_BREAK;
                });
                return output;
            }

            Object.keys(data).forEach((attribute) => {
                output += attribute + LINE_BREAK;
                output += convertToString(data[attribute]) + LINE_BREAK;
            });

            return output;
        };

        this.export([convertToString(data)], "text/csv;charset=utf-8;", "csv");
    }

    async xlsx() {
        const JSZip = (await import("jszip")).default; // Note the '.default'

        const data = [
            { name: "John Doe", age: 28, email: "john.doe@example.com" },
            { name: "Jane Doe", age: 22, email: "jane.doe@example.com" },
        ];

        const xmlHeader =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

        const workbookXML = `${xmlHeader}
    <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheets>
        <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
      </sheets>
    </workbook>`;

        let worksheetXML = `${xmlHeader}
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
               xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheetData>
        <row>
          <c t="inlineStr"><is><t>Name</t></is></c>
          <c t="inlineStr"><is><t>Age</t></is></c>
          <c t="inlineStr"><is><t>Email</t></is></c>
        </row>`;

        data.forEach((item) => {
            worksheetXML += `<row>
      <c t="inlineStr"><is><t>${item.name}</t></is></c>
      <c t="inlineStr"><is><t>${item.age}</t></is></c>
      <c t="inlineStr"><is><t>${item.email}</t></is></c>
    </row>`;
        });

        worksheetXML += `</sheetData></worksheet>`;

        const relsXML = `${xmlHeader}
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
    </Relationships>`;

        const contentTypesXML = `${xmlHeader}
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
      <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    </Types>`;

        const zip = new JSZip();
        zip.file("xl/workbook.xml", workbookXML);
        zip.file("xl/worksheets/sheet1.xml", worksheetXML);
        zip.file(
            "_rels/.rels",
            `${xmlHeader}
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
    </Relationships>`
        );
        zip.file("xl/_rels/workbook.xml.rels", relsXML);
        zip.file("[Content_Types].xml", contentTypesXML);


        let content = await zip.generateAsync({ type: "blob" });
        this.export(
            content,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "xlsx"
        );
    }

    json(data: Array<object | string | number> | object) {
        this.export(
            [JSON.stringify(data, null, 2)],
            "application/json",
            "json"
        );
    }

    export(data: Blob | Array<BlobPart>, type: string, extension: string) {
        let url = window.URL.createObjectURL(
            data instanceof Blob
                ? data
                : new Blob(data, {
                    type: "text/csv;charset=utf-8;",
                })
        );
        var a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute(
            "download",
            new Date().toLocaleString() + "." + extension
        );
        a.click();
    }
}
