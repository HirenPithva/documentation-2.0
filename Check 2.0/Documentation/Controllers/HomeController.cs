using check.Models;
using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using Spire.Xls;
using System.Drawing;
using System.Net.Http;
using System.Threading.Tasks;

namespace check.Controllers
{
    public class HomeController : Controller
    {

        [HttpGet]
        public ActionResult Home()
        {
            var bilabel = new SelectList(new[] {
                new {value="BRK", display="BHAVESHBHAI"},
                new {value="RVV", display="RAVIBHAI"},
                new {value="RMP", display="RAMRAJBHAI"},
                new {value="SHV", display="VISHALBHAI"},
                new {value="RVM", display="Temp"}

            }, "value", "display");
            var temp = new fileModel();
            temp.bilabels = bilabel;
            return View(temp);
        }
        void createPath(string Path)
        {
            bool is_Exist = Directory.Exists(Server.MapPath(Path));
            if (!is_Exist)
            {
                Directory.CreateDirectory(Server.MapPath(Path));
            }

        }
        [HttpGet]
        public ActionResult getFile(fileModel UserInput)
        {
            // uncomment after the devlopment
            TempData["Bilabel"] = UserInput.Bilabel.ToUpper();
            TempData["StartTicketDate"] = UserInput.StartTicketDate;
            TempData["EndTicketDate"] = UserInput.EndTicketDate;
            TempData["Ticket"] = UserInput.Ticket.ToUpper();
            string FilePath = "~/Documentation/" + TempData.Peek("Ticket") + "/" + ((DateTime)TempData.Peek("EndTicketDate")).ToString("ddMMMMyyyy");
            bool isexist = Directory.Exists(Server.MapPath(FilePath));
            if (isexist)
            {
                Directory.Delete(Server.MapPath(FilePath), true);
            }

            createPath(FilePath);
            return View();
        }
        [HttpPost]
        public ActionResult getFile(HttpPostedFileBase[] Mfile)
        {


            string FilePath = "~/Documentation/" + TempData.Peek("Ticket") + "/" + ((DateTime)TempData.Peek("EndTicketDate")).ToString("ddMMMMyyyy");
            string RefrenceFilePath = FilePath + "/Refrence Code Files";
            foreach (HttpPostedFileBase file in Mfile)
            {
                var FileExtension = Path.GetExtension(file.FileName);
                var extensions = new extensionModel();
                if (extensions.ExtensionRef.Contains(FileExtension))
                {
                    createPath(RefrenceFilePath);
                    var name = Path.GetFileName(file.FileName);
                    var uploadFilePath = Path.Combine(Server.MapPath(RefrenceFilePath), name);
                    file.SaveAs(uploadFilePath);
                }
            }
            var fileList = new fileModel();
            List<string> files = new List<string>();
            string[] AllFiles = Directory.GetFiles(Server.MapPath(RefrenceFilePath));
            foreach (string file in AllFiles)
            {
                string name = Path.GetFileName(file);
                files.Add(name);
            }
            fileList.FilePaths = files;
            return View(fileList);
        }
        public ActionResult FileProcess()
        {
            ViewBag.ErrorMessage = "";

            try
            {
                string FilePath = "~/Documentation/" + TempData.Peek("Ticket") + "/" + ((DateTime)TempData.Peek("EndTicketDate")).ToString("ddMMMMyyyy");
                string RefrenceFilePath = FilePath + "/Refrence Code Files";
                string[] AllFiles = Directory.GetFiles(Server.MapPath(RefrenceFilePath));
                DateListModel DateVar = new DateListModel();
                List<string> RangeOfDate = DateVar.DateRange((DateTime)TempData.Peek("StartTicketDate"), (DateTime)TempData.Peek("EndTicketDate"));
                int excellIndex = 2;
                var replacements = new Dictionary<string, string> {
                                            { "(Add)", "" },
                                            { "Line:", "" },
                                            { "IEnd", ""},
                                            { "MEnd",""},
                                            { "MStart",""},
                                            { "IStart",""},
                                            { "//",""},
                                            { "--",""},
                                            { "(Revision)",""},
                                            { (TempData.Peek("Ticket")+",").ToString(),""},
                                            { TempData.Peek("Bilabel").ToString(),""},
                                            { "(Modify)",""} };
                foreach (string d in RangeOfDate)
                {
                    replacements[d] = "";
                }
                string clean(string s)
                {
                    foreach (string to_replace in replacements.Keys)
                    {
                        s = s.Replace(to_replace, replacements[to_replace]);
                    }
                    return s;
                }
                //WorkBook workbook = WorkBook.Create(ExcelFileFormat.XLSX);
                //var sheet = workbook.CreateWorkSheet("example_sheet");
                //ExcelEngine excelEngine = new ExcelEngine();
                //IApplication application = excelEngine.Excel;

                //application.DefaultVersion = ExcelVersion.Excel2016;
                //IWorkbook workbook = application.Workbooks.Create(1);
                //IWorksheet sheet = workbook.Worksheets[0];
                Workbook workbook = new Workbook();
                //workbook.Version = Spire.Xls.ExcelVersion.Version2013;
                workbook.Version = ExcelVersion.Version2007;//or above Version

                Worksheet sheet = workbook.Worksheets[0];
                sheet.Range["A1"].Text = "";
                sheet.Range["B1"].Text = "Ticket #";
                sheet.Range["C1"].Text = "Ticket Title";
                sheet.Range["D1"].Text = "Functionality Changes";
                sheet.Range["E1"].Text = "Test Plan";
                sheet.Range["F1"].Text = "Source File Name";
                sheet.Range["G1"].Text = "File Type";
                sheet.Range["H1"].Text = "Method/SQL Object Name";
                sheet.Range["I1"].Text = "Line #";
                sheet.Range["J1"].Text = "Changes";
                sheet.Range["K1"].Text = "Need to Modify any data in table";
                sheet.Range["L1"].Text = "New Config Value?  If so, explain";
                sheet.Range["M1"].Text = "Controls, screens, or menus updated? If so, explain";
                sheet.Range["A1:M1"].Style.Color = Color.FromArgb(207, 226, 243);

                //sheet.Range["A1:M1"].Style.Font.Bold = true;
                //sheet.Range["A1:M1"].CellStyle.Font.Bold = true;
                sheet.Range["A1:M1"].Style.Font.IsBold = true;


                foreach (string filePath in AllFiles)
                {

                    string[] texts = System.IO.File.ReadAllLines(filePath);

                    if (".js" == Path.GetExtension(filePath))
                    {
                        List<string> STRtxt = new List<string>();
                        int txtINdex = 0;
                        int FlagParaI = -1;
                        int FlagParaM = -1;
                        int FlagFunS = -1;
                        int FlagIsFun = -1;
                        int fun = -1;
                        int isRevision = -1;
                        bool isStackStarted = false;
                        bool isFunStackStarted = false;
                        bool underTheComment = false;

                        string FunName = string.Empty;
                        Stack<char> FindEndFun = new Stack<char>();
                        Stack<char> FindEndFunName = new Stack<char>();
                        for (int i = 0; i < texts.Length; i++)
                        {

                            //get Function Name
                            if ((texts[i].Contains("function") ||
                                (texts[i].Contains(".click") && texts[i].Contains("$"))) && fun < 0 && !underTheComment)
                            {
                                string findComment = string.Empty;
                                if (texts[i].Contains("function"))
                                {
                                    findComment = texts[i].Substring(0, texts[i].IndexOf("function"));
                                }
                                if (!findComment.Contains("//") && !findComment.Contains("/*") && texts[i].Contains("function"))
                                {
                                    string tempFunName = texts[i].Substring(texts[i].IndexOf("function") + 8, texts[i].Length - (texts[i].IndexOf("function") + 8)).Trim();

                                    if (!(tempFunName[0] == '('))
                                    {
                                        fun = i;
                                        FunName = tempFunName.Substring(0, tempFunName.IndexOf('('));
                                    }
                                }
                                if (fun < 0 && texts[i].Contains("$") && texts[i].Contains("click"))
                                {
                                    string temp = Regex.Replace(texts[i], @"\s", "");
                                    findComment = string.Empty;
                                    findComment = temp.Substring(0, temp.IndexOf("$"));
                                    if (!(findComment.Contains("//") && temp.Contains("click")))
                                    {
                                        string tempClickName = temp.Substring(temp.IndexOf("$"), temp.IndexOf("click") - temp.IndexOf("$")).Trim();
                                        if (tempClickName[tempClickName.Length - 1] == '.')
                                        {
                                            fun = i;
                                            FunName = tempClickName + "click";
                                        }
                                    }
                                }
                            }



                            //Added line under the CODE label
                            if (FlagParaI >= 0)
                            {
                                STRtxt.Add(texts[i]); txtINdex++;
                            }
                            if (FlagParaM >= 0)
                            {
                                STRtxt.Add(texts[i]); txtINdex++;
                            }

                            if (FlagIsFun >= 0)
                            {
                                //while (texts[i].Trim() == "")
                                //{
                                //    STRtxt.Add(texts[i]); txtINdex++;
                                //    i += 1;
                                //}

                                for (int ind = 0; ind < texts[i].Length; ind++)
                                {
                                    if (texts[i][ind] == '{')
                                    {
                                        FindEndFun.Push('{');
                                        if (!isStackStarted)
                                        {
                                            isStackStarted = true;
                                        }
                                    }
                                    else if (texts[i][ind] == '}')
                                    {
                                        FindEndFun.Pop();
                                    }
                                }
                                if (isStackStarted)
                                {
                                    if (FindEndFun.Count == 0)
                                    {
                                        isStackStarted = false;
                                        STRtxt[FlagIsFun] += "-" + (i + 1) + " (Add)";
                                        STRtxt.Add(texts[i]); txtINdex++;
                                        STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                        sheet.Range["H" + excellIndex].Text = FunName;
                                        sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                        sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                        //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagIsFun], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                        sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagIsFun]);
                                        excellIndex += 1;

                                        FlagIsFun = -1;
                                    }
                                    else
                                    {
                                        STRtxt.Add(texts[i]); txtINdex++;
                                    }
                                }


                            }

                            if (texts[i].Contains("/***********************************"))
                            {
                                FlagFunS = i;
                                underTheComment = true;
                            }
                            if (FlagFunS >= 0)
                            {
                                if (texts[i].Contains((TempData.Peek("Bilabel") + " ").ToString()) && Is_date(texts[i]) && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                {
                                    int index = i + 1;
                                    while (texts[index].Trim() == "")
                                    {
                                        index += 1;
                                    }
                                    if (texts[index].Contains("************************************/"))
                                    {
                                        string st = texts[i];
                                        //sheet["J" + excellIndex].Value = texts[i].Substring(texts[i].IndexOf(TempData.Peek("Ticket").ToString()), texts[i].Length - texts[i].IndexOf(TempData.Peek("Ticket").ToString()));
                                        //sheet["J" + excellIndex].Value = replacements.Aggregate(texts[i], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                        sheet.Range["J" + excellIndex].Text = clean(texts[i]);
                                        FlagIsFun = txtINdex;
                                        STRtxt.Add("Line: " + (FlagFunS + 1)); txtINdex++;
                                        STRtxt.Add("Code: "); txtINdex++;
                                        while (FlagFunS != index)
                                        {
                                            STRtxt.Add(texts[FlagFunS]); txtINdex++;
                                            FlagFunS += 1;
                                        }
                                        i = index;
                                        STRtxt.Add(texts[i]); txtINdex++;
                                        FlagFunS = -1;
                                    }
                                    else
                                    {
                                        STRtxt.Add("Line: " + (i + 1) + " (Revision)"); txtINdex++;
                                        string st = STRtxt[txtINdex - 1];
                                        //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[txtINdex - 1], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                        sheet.Range["I" + excellIndex].Text = clean(STRtxt[txtINdex - 1]);

                                        STRtxt.Add("Code: "); txtINdex++;
                                        STRtxt.Add(texts[i]); txtINdex++;
                                        STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                        sheet.Range["H" + excellIndex].Text = FunName;
                                        sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                        sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                        //she.Rangeet["I" + excellIndex].Value = STRtxt[txtINdex - 2].Trim().Replace("Line:", "").Replace(" (Revision)", "");

                                        sheet.Range["J" + excellIndex].Text = "Revision History";
                                        isRevision = excellIndex;
                                        excellIndex += 1;

                                        FlagFunS = -1;
                                    }
                                }
                            }
                            if (texts[i].Contains("************************************/"))
                            {
                                FlagFunS = -1;
                                underTheComment = false;
                            }
                            if (isRevision > -1 && FunName != string.Empty)
                            {
                                sheet.Range["H" + isRevision].Text = FunName;
                                isRevision = -1;
                            }

                            if ((texts[i].Contains("Start ") || texts[i].Contains("End "))
                                && Is_date(texts[i]) && texts[i].Contains((" " + TempData.Peek("Bilabel") + " ").ToString())
                                && texts[i].Contains(TempData.Peek("Ticket").ToString()) && texts[i].Contains("//"))
                            {
                                if (texts[i].Contains("IStart ") && texts[i].Contains("IEnd "))
                                {
                                    STRtxt.Add("Line: " + (i + 1) + " (Add)"); txtINdex++;
                                    STRtxt.Add("Code: "); txtINdex++;
                                    STRtxt.Add(texts[i]); txtINdex++;
                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                    sheet.Range["H" + excellIndex].Text = FunName;
                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                    sheet.Range["I" + excellIndex].Text = (i + 1).ToString();
                                    //sheet["J" + excellIndex].Value = texts[i].Substring(texts[i].IndexOf((TempData.Peek("Ticket")).ToString()), texts[i].Length - texts[i].IndexOf((TempData.Peek("Ticket")).ToString()));
                                    //sheet["J" + excellIndex].Value = replacements.Aggregate(texts[i], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                    sheet.Range["J" + excellIndex].Text = clean(texts[i].Substring(texts[i].IndexOf("//"), texts[i].Length - texts[i].IndexOf("//")));
                                    excellIndex += 1;
                                }
                                else if (texts[i].Contains("MStart ") && texts[i].Contains("MEnd "))
                                {
                                    STRtxt.Add("Line: " + (i + 1) + " (Modify)"); txtINdex++;
                                    STRtxt.Add("Code: "); txtINdex++;
                                    STRtxt.Add(texts[i]); txtINdex++;
                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                    sheet.Range["H" + excellIndex].Text = FunName;
                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                    sheet.Range["I" + excellIndex].Text = (i + 1).ToString();
                                    //sheet["J" + excellIndex].Value = texts[i].Substring(texts[i].IndexOf((TempData.Peek("Ticket")).ToString()), texts[i].Length - texts[i].IndexOf((TempData.Peek("Ticket")).ToString()));
                                    //sheet["J" + excellIndex].Value = replacements.Aggregate(texts[i], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                    sheet.Range["J" + excellIndex].Text = clean(texts[i].Substring(texts[i].IndexOf("//"), texts[i].Length - texts[i].IndexOf("//")));
                                    excellIndex += 1;
                                }
                                else
                                {

                                    if (texts[i].Contains("IStart ") && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                    {
                                        if (FlagParaI >= 0)
                                        {
                                            ViewBag.ErrorMessage += "After the Line Number " + i + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            FlagParaI = txtINdex;
                                            STRtxt.Add("Line: " + (i + 1)); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            STRtxt.Add(texts[i]); txtINdex++;

                                        }
                                    }
                                    else if (texts[i].Contains("MStart ") && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                    {
                                        if (FlagParaM > 0)
                                        {
                                            ViewBag.ErrorMessage += "After the Line Number " + i + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            FlagParaM = txtINdex;
                                            STRtxt.Add("Line: " + (i + 1)); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            STRtxt.Add(texts[i]); txtINdex++;
                                        }
                                    }
                                    else if (texts[i].Contains("IEnd "))
                                    {
                                        if (FlagParaM >= 0 || FlagParaI < 0)
                                        {
                                            STRtxt[FlagParaM] += "-" + (i + 1) + " (Modify)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;

                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            //sheet["I" + excellIndex].Value = STRtxt[FlagParaM].Trim().Replace("Line:", "").Replace(" (Modify)", "");
                                            //sheet["J" + excellIndex].Value = STRtxt[FlagParaM + 2].Substring(STRtxt[FlagParaM + 2].IndexOf((TempData.Peek("Ticket")).ToString()), STRtxt[FlagParaM + 2].Length - STRtxt[FlagParaM + 2].IndexOf((TempData.Peek("Ticket")).ToString()));
                                            //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaM], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                            //sheet["J" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaM + 2], (current, replacement) => current.Replace(replacement.Key, replacement.Value));
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2]);
                                            excellIndex += 1;
                                            FlagParaM = -1;

                                            ViewBag.ErrorMessage += "At the Line Number " + i + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            STRtxt[FlagParaI] += "-" + (i + 1) + " (Add)";

                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            //sheet["I" + excellIndex].Value = STRtxt[FlagParaI].Trim().Replace("Line:", "").Replace(" (Add)", "");
                                            //sheet["J" + excellIndex].Value = STRtxt[FlagParaI + 2].Substring(STRtxt[FlagParaI + 2].IndexOf((TempData.Peek("Ticket")).ToString()), STRtxt[FlagParaI + 2].Length - STRtxt[FlagParaI + 2].IndexOf((TempData.Peek("Ticket")).ToString()));
                                            //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaI], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            //sheet["J" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaI + 2], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);

                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2]);
                                            excellIndex += 1;
                                            FlagParaI = -1;

                                        }
                                    }
                                    else if (texts[i].Contains("MEnd "))
                                    {
                                        if (FlagParaI >= 0 || FlagParaM < 0)
                                        {
                                            STRtxt[FlagParaI] += "-" + (i + 1) + " (Add)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            //sheet["I" + excellIndex].Value = STRtxt[FlagParaI].Trim().Replace("Line:", "").Replace(" (Add)", "");
                                            //sheet["J" + excellIndex].Value = STRtxt[FlagParaI + 2].Substring(STRtxt[FlagParaI + 2].IndexOf((TempData.Peek("Ticket")).ToString()), STRtxt[FlagParaI + 2].Length - STRtxt[FlagParaI + 2].IndexOf((TempData.Peek("Ticket")).ToString()));
                                            //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaI], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            //sheet["J" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaI + 2], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2]);
                                            excellIndex += 1;
                                            FlagParaI = -1;
                                            ViewBag.ErrorMessage += "At the Line Number " + i + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            STRtxt[FlagParaM] += "-" + (i + 1) + " (Modify)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            //sheet["I" + excellIndex].Value = STRtxt[FlagParaM].Trim().Replace("Line:", "").Replace(" (Modify)", "");
                                            //sheet["J" + excellIndex].Value = STRtxt[FlagParaM + 2].Substring(STRtxt[FlagParaM + 2].IndexOf((TempData.Peek("Ticket")).ToString()), STRtxt[FlagParaM + 2].Length - STRtxt[FlagParaM + 2].IndexOf((TempData.Peek("Ticket")).ToString()));
                                            //sheet["I" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaM], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            //sheet["J" + excellIndex].Value = replacements.Aggregate(STRtxt[FlagParaM + 2], (current, replacement) => current.Replace(replacement.Key, replacement.Value)).ToString();
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2]);
                                            excellIndex += 1;
                                            FlagParaM = -1;
                                        }
                                    }
                                    else
                                    {
                                        ViewBag.ErrorMessage += "At the Line Number " + i + " can't find Valid Comment in Following File " + Path.GetFileName(filePath) + "////////";
                                        return View();
                                    }
                                }


                            }

                            if (fun >= 0)
                            {
                                string str = Regex.Replace(texts[i], @"\s", "");

                                for (int indOfFunName = 0; indOfFunName < str.Length; indOfFunName++)
                                {

                                    if (indOfFunName + 2 < str.Length && str[indOfFunName] == '/' && str[indOfFunName + 1] == '/' && str[indOfFunName + 2] != '/')
                                    {
                                        break;
                                    }


                                    if (FunName[0] == '$')
                                    {
                                        if (str[indOfFunName] == '(')
                                        {
                                            FindEndFunName.Push('(');
                                            if (!isFunStackStarted)
                                            {
                                                isFunStackStarted = true;
                                            }
                                        }
                                        else if (str[indOfFunName] == ')')
                                        {
                                            FindEndFunName.Pop();
                                        }
                                    }
                                    else
                                    {
                                        if (str[indOfFunName] == '{')
                                        {
                                            FindEndFunName.Push('{');
                                            if (!isFunStackStarted)
                                            {
                                                isFunStackStarted = true;
                                            }
                                        }
                                        else if (str[indOfFunName] == '}')
                                        {
                                            FindEndFunName.Pop();
                                        }
                                    }
                                }
                                if (FindEndFunName.Count == 0 && isFunStackStarted)
                                {
                                    isFunStackStarted = false;
                                    fun = -1;
                                    FunName = string.Empty;
                                }
                            }

                        }
                        string[] StrTxtFile = STRtxt.ToArray();
                        if (StrTxtFile.Length > 0)
                        {
                            string txtFilePath = FilePath + "/" + Path.GetFileNameWithoutExtension(filePath) + ".txt";
                            System.IO.File.WriteAllLines(Server.MapPath(txtFilePath), StrTxtFile);

                        }


                    }

                    if (".vb" == Path.GetExtension(filePath))
                    {
                        List<string> STRtxt = new List<string>();
                        int txtINdex = 0;
                        //insert update comment flag
                        int FlagParaI = -1;
                        int FlagParaM = -1;

                        //revision history blog started flag
                        int isRhInitiate = -1;
                        int isFun = -1;

                        //isFunction or isSub flag
                        bool isFunction = false;
                        bool isSub = false;
                        bool isVariable = false;
                        bool anyOther = false;

                        //variable for storing function name
                        string FunName = string.Empty;

                        //general function and sub variable
                        bool CheckFunction = false;
                        bool CheckSub = false;
                        string CheckFunName = string.Empty;

                        //Revision flag
                        int isRevision = -1;

                        //Report flag
                        bool isReport = false;

                        //for checking this VB file is belongs to Report or Service
                        for (int LineNum = 0; LineNum < texts.Length; LineNum++)
                        {
                            if (texts[LineNum].Contains("Implements ") && texts[LineNum].Contains(" IReport"))
                            {
                                string temp = texts[LineNum].Substring(texts[LineNum].IndexOf("Implements "), texts[LineNum].Length - texts[LineNum].IndexOf("Implements "));
                                if (!temp.Contains("'"))
                                {
                                    temp = texts[LineNum].Substring(texts[LineNum].IndexOf("Implements") + 10, texts[LineNum].Length - texts[LineNum].IndexOf("Implements") - 10).Trim();
                                    if (temp.IndexOf("IReport") == 0)
                                    {
                                        isReport = true;
                                        break;
                                    }
                                }
                            }
                        }


                        for (int LineNum = 0; LineNum < texts.Length; LineNum++)
                        {

                            //if FlagParaI and FlagParaM active then txt file update
                            if (FlagParaI >= 0)
                            {
                                STRtxt.Add(texts[LineNum]); txtINdex++;
                            }
                            if (FlagParaM >= 0)
                            {
                                STRtxt.Add(texts[LineNum]); txtINdex++;
                            }
                            //if isFun is true then txt file update
                            if (isFun > -1)
                            {
                                if (!anyOther && !isVariable && !isSub && !isFunction)
                                {
                                    string funStr = texts[LineNum].Trim();
                                    if (funStr.IndexOf("'''") == 0 || funStr.IndexOf("<OperationContract()>") == 0)
                                    {
                                        anyOther = true;
                                    }
                                    else if ((funStr.IndexOf("Public ") == 0 || funStr.IndexOf("Private ") == 0) &&
                                        !texts[LineNum].Contains(" Sub ") && !texts[LineNum].Contains(" Function "))
                                    {
                                        isVariable = true;
                                    }
                                    else if ((funStr.IndexOf("Public ") == 0 || funStr.IndexOf("Private ") == 0) &&
                                            (texts[LineNum].Contains(" Sub ") || texts[LineNum].Contains(" Function ")))
                                    {
                                        if (texts[LineNum].Contains(" Sub "))
                                        {
                                            string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Sub "));
                                            if (!temp.Contains("'"))
                                            {
                                                isSub = true;
                                                FunName = texts[LineNum].Substring(texts[LineNum].IndexOf("Sub ") + 4, texts[LineNum].IndexOf("(") - (texts[LineNum].IndexOf("Sub ") + 4));
                                            }
                                        }
                                        if (texts[LineNum].Contains(" Function "))
                                        {
                                            string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Function "));
                                            if (!temp.Contains("'"))
                                            {
                                                isFunction = true;
                                                FunName = texts[LineNum].Substring(texts[LineNum].IndexOf("Function ") + 9, texts[LineNum].IndexOf("(") - (texts[LineNum].IndexOf("Function ") + 9));
                                            }
                                        }
                                    }
                                    else
                                    {
                                        sheet.Range["H" + excellIndex].Text = FunName;
                                        sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                        sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                        FunName = string.Empty;
                                        isSub = false;
                                        STRtxt[isFun] = STRtxt[isFun] + " - " + (LineNum + 1) + " (Add)";
                                        STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                        sheet.Range["I" + excellIndex].Text = clean(STRtxt[isFun]);
                                        isFun = -1;
                                        excellIndex += 1;
                                    }

                                }


                                if (anyOther || isVariable || isSub || isFunction)
                                {
                                    STRtxt.Add(texts[LineNum]); txtINdex++;
                                    if (isSub)
                                    {
                                        if (texts[LineNum].Contains("End ") && texts[LineNum].Contains(" Sub"))
                                        {
                                            string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("End"));
                                            if (!temp.Contains("'"))
                                            {
                                                temp = string.Empty;
                                                temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Sub"));
                                                if (!temp.Contains("'"))
                                                {
                                                    sheet.Range["H" + excellIndex].Text = FunName;
                                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                    FunName = string.Empty;
                                                    isSub = false;
                                                    STRtxt[isFun] = STRtxt[isFun] + " - " + (LineNum + 1) + " (Add)";
                                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                    sheet.Range["I" + excellIndex].Text = clean(STRtxt[isFun]);
                                                    isFun = -1;
                                                    excellIndex += 1;
                                                }
                                            }
                                        }

                                    }
                                    else if (isFunction)
                                    {
                                        if (texts[LineNum].Contains("End ") && texts[LineNum].Contains(" Function"))
                                        {
                                            string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("End"));
                                            if (!temp.Contains("'"))
                                            {
                                                temp = string.Empty;
                                                temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Function"));
                                                if (!temp.Contains("'"))
                                                {
                                                    sheet.Range["H" + excellIndex].Text = FunName;
                                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                    FunName = string.Empty;
                                                    isFunction = false;
                                                    STRtxt[isFun] = STRtxt[isFun] + " - " + (LineNum + 1) + " (Add)";
                                                    sheet.Range["I" + excellIndex].Text = clean(STRtxt[isFun]);
                                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                    isFun = -1;
                                                    excellIndex += 1;
                                                }
                                            }
                                        }

                                    }
                                    else if (isVariable)
                                    {
                                        isVariable = false;
                                    }
                                    else if (anyOther)
                                    {
                                        anyOther = false;
                                    }
                                }



                            }

                            //get function name
                            string tempStrForFunName = texts[LineNum].Trim();
                            if ((tempStrForFunName.IndexOf("Public ") == 0 || tempStrForFunName.IndexOf("Private ") == 0) &&
                                (texts[LineNum].Contains(" Sub ") || texts[LineNum].Contains(" Function ")) &&
                                 !CheckSub && !CheckFunction)
                            {
                                if (texts[LineNum].Contains(" Sub "))
                                {
                                    string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Sub "));
                                    if (!temp.Contains("'"))
                                    {
                                        CheckSub = true;
                                        FunName = texts[LineNum].Substring(texts[LineNum].IndexOf("Sub ") + 4, texts[LineNum].IndexOf("(") - texts[LineNum].IndexOf("Sub ") - 4);
                                    }
                                }
                                if (texts[LineNum].Contains(" Function "))
                                {
                                    string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Function "));
                                    if (!temp.Contains("'"))
                                    {
                                        CheckFunction = true;
                                        FunName = texts[LineNum].Substring(texts[LineNum].IndexOf("Function ") + 9, texts[LineNum].IndexOf("(") - (texts[LineNum].IndexOf("Function ") + 9));
                                    }
                                }
                            }
                            if (isRevision > -1 && FunName != string.Empty)
                            {
                                sheet.Range["H" + isRevision].Text = FunName;
                                isRevision = -1;
                            }
                            if (CheckSub || CheckFunction)
                            {
                                if (CheckSub)
                                {
                                    if (texts[LineNum].Contains("End ") && texts[LineNum].Contains(" Sub"))
                                    {
                                        string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("End"));
                                        if (!temp.Contains("'"))
                                        {
                                            temp = string.Empty;
                                            temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Sub"));
                                            if (!temp.Contains("'"))
                                            {
                                                FunName = string.Empty;
                                                CheckSub = false;
                                            }
                                        }
                                    }

                                }
                                else if (CheckFunction)
                                {
                                    if (texts[LineNum].Contains("End ") && texts[LineNum].Contains(" Function"))
                                    {
                                        string temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("End"));
                                        if (!temp.Contains("'"))
                                        {
                                            temp = string.Empty;
                                            temp = texts[LineNum].Substring(0, texts[LineNum].IndexOf("Function"));
                                            if (!temp.Contains("'"))
                                            {
                                                FunName = string.Empty;
                                                CheckFunction = false;
                                            }
                                        }
                                    }

                                }

                            }

                            //distinguish bw revision history and add new function
                            if (!isReport && texts[LineNum].Contains("'''") && isRhInitiate < 0)
                            {
                                string remarkStr = texts[LineNum].Substring(texts[LineNum].IndexOf("'''"), texts[LineNum].Length - texts[LineNum].IndexOf("'''"));
                                if (remarkStr.Contains("<summary>"))
                                {
                                    isRhInitiate = LineNum + 1;

                                }
                            }

                            if (isRhInitiate > -1 && texts[LineNum].Trim().IndexOf("'''") != 0)
                            {
                                isRhInitiate = -1;
                            }
                            if (isRhInitiate > -1)
                            {

                                if (texts[LineNum].Contains("'''") && texts[LineNum].Contains((TempData.Peek("Bilabel") + " ").ToString())
                                    && Is_date(texts[LineNum]) && texts[LineNum].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                {
                                    int nextIndex = LineNum + 1;
                                    while (texts[nextIndex].Trim() == "")
                                    {
                                        nextIndex++;
                                    }
                                    if (texts[nextIndex].Contains("'''"))
                                    {
                                        string RemarkStr = texts[nextIndex].Substring(texts[nextIndex].IndexOf("'''"), texts[nextIndex].Length - texts[nextIndex].IndexOf("'''"));
                                        if (!RemarkStr.Contains("</remarks>"))
                                        {
                                            STRtxt.Add("Line: " + (LineNum + 1) + " (Revision)"); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            STRtxt.Add(texts[LineNum]); txtINdex++;
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            sheet.Range["I" + excellIndex].Text = (LineNum + 1).ToString();
                                            sheet.Range["J" + excellIndex].Text = "Revision history";
                                            isRevision = excellIndex;
                                            excellIndex += 1;
                                        }
                                        else if (RemarkStr.Contains("</remarks>"))
                                        {
                                            int temp = isRhInitiate - 1;
                                            isFun = txtINdex;
                                            STRtxt.Add("Line: " + isRhInitiate); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            while (temp != LineNum)
                                            {
                                                STRtxt.Add(texts[temp]); txtINdex++;
                                                temp++;
                                            }
                                            STRtxt.Add(texts[LineNum]); txtINdex++;
                                            sheet.Range["J" + excellIndex].Text = clean(texts[LineNum].Substring(texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString()), texts[LineNum].Length - texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString())));

                                        }
                                    }
                                    else
                                    {
                                        isFun = txtINdex;
                                        int temp = isRhInitiate - 1;
                                        STRtxt.Add("Line: " + isRhInitiate); txtINdex++;
                                        STRtxt.Add("Code: "); txtINdex++;
                                        while (temp != LineNum)
                                        {
                                            STRtxt.Add(texts[temp]); txtINdex++;
                                            temp++;
                                        }
                                        STRtxt.Add(texts[LineNum]); txtINdex++;
                                        sheet.Range["J" + excellIndex].Text = clean(texts[LineNum].Substring(texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString()), texts[LineNum].Length - texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString())));
                                    }
                                    isRhInitiate = -1;
                                }
                            }



                            //Checking Comment contain necessary data related the documentation
                            if (texts[LineNum].Contains("'"))
                            {
                                string commentStr = texts[LineNum].Substring(texts[LineNum].IndexOf("'"), texts[LineNum].Length - texts[LineNum].IndexOf("'"));
                                if (commentStr.Length > 0 && (commentStr.Contains("Start") || commentStr.Contains("End"))
                                    && Is_date(commentStr) && commentStr.Contains((" " + TempData.Peek("Bilabel") + " ").ToString())
                                    && commentStr.Contains(TempData.Peek("Ticket").ToString()))
                                {
                                    if (commentStr.Contains("IStart ") && commentStr.Contains("IEnd "))
                                    {
                                        STRtxt.Add("Line: " + (LineNum + 1) + " (Add)"); txtINdex++;
                                        STRtxt.Add("Code: "); txtINdex++;
                                        STRtxt.Add(texts[LineNum]); txtINdex++;
                                        STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                        sheet.Range["H" + excellIndex].Text = FunName;
                                        sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                        sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                        sheet.Range["I" + excellIndex].Text = (LineNum + 1).ToString();
                                        sheet.Range["J" + excellIndex].Text = clean(texts[LineNum].Substring(texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString()), texts[LineNum].Length - texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString())));
                                        excellIndex += 1;

                                    }
                                    else if (commentStr.Contains("MStart ") && commentStr.Contains("MEnd "))
                                    {
                                        STRtxt.Add("Line: " + (LineNum + 1) + " (Modify)"); txtINdex++;
                                        STRtxt.Add("Code: "); txtINdex++;
                                        STRtxt.Add(texts[LineNum]); txtINdex++;
                                        STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                        sheet.Range["H" + excellIndex].Text = FunName;
                                        sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                        sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                        sheet.Range["I" + excellIndex].Text = (LineNum + 1).ToString();
                                        sheet.Range["J" + excellIndex].Text = clean(texts[LineNum].Substring(texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString()), texts[LineNum].Length - texts[LineNum].IndexOf(TempData.Peek("Ticket").ToString())));
                                        excellIndex += 1;
                                    }
                                    else
                                    {

                                        if (commentStr.Contains("IStart ") && commentStr.Contains((TempData.Peek("Ticket") + ",").ToString()))
                                        {
                                            if (FlagParaI >= 0)
                                            {
                                                ViewBag.ErrorMessage += "After the Line Number " + LineNum + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                                return View();
                                            }
                                            else
                                            {
                                                FlagParaI = txtINdex;
                                                STRtxt.Add("Line: " + (LineNum + 1)); txtINdex++;
                                                STRtxt.Add("Code: "); txtINdex++;
                                                STRtxt.Add(texts[LineNum]); txtINdex++;

                                            }
                                        }
                                        else if (commentStr.Contains("MStart ") && commentStr.Contains((TempData.Peek("Ticket") + ",").ToString()))
                                        {
                                            if (FlagParaM > 0)
                                            {
                                                ViewBag.ErrorMessage += "After the Line Number " + LineNum + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                                return View();
                                            }
                                            else
                                            {
                                                FlagParaM = txtINdex;
                                                STRtxt.Add("Line: " + (LineNum + 1)); txtINdex++;
                                                STRtxt.Add("Code: "); txtINdex++;
                                                STRtxt.Add(texts[LineNum]); txtINdex++;
                                            }
                                        }
                                        else if (commentStr.Contains("IEnd "))
                                        {
                                            if (FlagParaM >= 0 || FlagParaI < 0)
                                            {
                                                STRtxt[FlagParaM] += "-" + (LineNum + 1) + " (Modify)";
                                                STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                sheet.Range["H" + excellIndex].Text = FunName;
                                                sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                                sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2].Substring(STRtxt[FlagParaM + 2].IndexOf(TempData.Peek("Ticket").ToString()), STRtxt[FlagParaM + 2].Length - STRtxt[FlagParaM + 2].IndexOf(TempData.Peek("Ticket").ToString())));
                                                excellIndex += 1;
                                                FlagParaM = -1;

                                                ViewBag.ErrorMessage += "At the Line Number " + LineNum + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                                return View();
                                            }
                                            else
                                            {
                                                STRtxt[FlagParaI] += "-" + (LineNum + 1) + " (Add)";

                                                STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                sheet.Range["H" + excellIndex].Text = FunName;
                                                sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);
                                                sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2].Substring(STRtxt[FlagParaI + 2].IndexOf(TempData.Peek("Ticket").ToString()), STRtxt[FlagParaI + 2].Length - STRtxt[FlagParaI + 2].IndexOf(TempData.Peek("Ticket").ToString())));
                                                excellIndex += 1;
                                                FlagParaI = -1;

                                            }
                                        }
                                        else if (commentStr.Contains("MEnd "))
                                        {
                                            if (FlagParaI >= 0 || FlagParaM < 0)
                                            {
                                                STRtxt[FlagParaI] += "-" + (LineNum + 1) + " (Add)";
                                                STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                sheet.Range["H" + excellIndex].Text = FunName;
                                                sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);
                                                sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2].Substring(STRtxt[FlagParaI + 2].IndexOf(TempData.Peek("Ticket").ToString()), STRtxt[FlagParaI + 2].Length - STRtxt[FlagParaI + 2].IndexOf(TempData.Peek("Ticket").ToString())));
                                                excellIndex += 1;
                                                FlagParaI = -1;
                                                ViewBag.ErrorMessage += "At the Line Number " + LineNum + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                                return View();
                                            }
                                            else
                                            {
                                                STRtxt[FlagParaM] += "-" + (LineNum + 1) + " (Modify)";
                                                STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                                sheet.Range["H" + excellIndex].Text = FunName;
                                                sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                                sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                                sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                                sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2].Substring(STRtxt[FlagParaM + 2].IndexOf(TempData.Peek("Ticket").ToString()), STRtxt[FlagParaM + 2].Length - STRtxt[FlagParaM + 2].IndexOf(TempData.Peek("Ticket").ToString())));
                                                excellIndex += 1;
                                                FlagParaM = -1;
                                            }
                                        }
                                        else
                                        {
                                            ViewBag.ErrorMessage += "At the Line Number " + LineNum + " can't find Valid Comment in Following File " + Path.GetFileName(filePath) + "////////";
                                            return View();
                                        }
                                    }

                                }
                            }
                        }



                        //create txt of vb file
                        string[] StrTxtFile = STRtxt.ToArray();
                        if (StrTxtFile.Length > 0)
                        {
                            string txtFilePath = FilePath + "/" + Path.GetFileNameWithoutExtension(filePath) + ".txt";
                            System.IO.File.WriteAllLines(Server.MapPath(txtFilePath), StrTxtFile);


                        }
                    }


                    if (".sql" == Path.GetExtension(filePath))
                    {
                        List<string> STRtxt = new List<string>();
                        int txtINdex = 0;
                        int FlagParaI = -1;
                        int FlagParaM = -1;
                        string FunName = Path.GetFileNameWithoutExtension(filePath);

                        for (int i = 0; i < texts.Length; i++)
                        {

                            if (!texts[i].Contains("IStart ") && !texts[i].Contains("IEnd ")
                                && !texts[i].Contains("MStart ") && !texts[i].Contains("MEnd ")
                                && texts[i].Contains(TempData.Peek("Bilabel").ToString())
                                && Is_date(texts[i]) && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString())
                                && texts[i].Contains("--"))
                            {
                                STRtxt.Add("Line: " + (i + 1) + " (Revision)"); txtINdex++;
                                STRtxt.Add("Code: "); txtINdex++;
                                STRtxt.Add(texts[i]); txtINdex++;
                                STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                sheet.Range["I" + excellIndex].Text = (i + 1).ToString();
                                sheet.Range["H" + excellIndex].Text = FunName;
                                sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);

                                sheet.Range["J" + excellIndex].Text = "Revision History";
                                excellIndex += 1;
                            }

                            if (FlagParaI >= 0)
                            {
                                STRtxt.Add(texts[i]); txtINdex++;
                            }
                            if (FlagParaM >= 0)
                            {
                                STRtxt.Add(texts[i]); txtINdex++;
                            }

                            if ((texts[i].Contains("Start ") || texts[i].Contains("End "))
                               && Is_date(texts[i]) && texts[i].Contains((" " + TempData.Peek("Bilabel") + " ").ToString())
                               && texts[i].Contains(TempData.Peek("Ticket").ToString()) && texts[i].Contains("--"))
                            {
                                if (texts[i].Contains("IStart ") && texts[i].Contains("IEnd "))
                                {
                                    STRtxt.Add("Line: " + (i + 1) + " (Add)"); txtINdex++;
                                    STRtxt.Add("Code: "); txtINdex++;
                                    STRtxt.Add(texts[i]); txtINdex++;
                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                    sheet.Range["H" + excellIndex].Text = FunName;
                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                    sheet.Range["I" + excellIndex].Text = (i + 1).ToString();
                                    sheet.Range["J" + excellIndex].Text = clean(texts[i].Substring(texts[i].IndexOf("--"), texts[i].Length - texts[i].IndexOf("--")));
                                    excellIndex += 1;
                                }
                                else if (texts[i].Contains("MStart ") && texts[i].Contains("MEnd "))
                                {
                                    STRtxt.Add("Line: " + (i + 1) + " (Modify)"); txtINdex++;
                                    STRtxt.Add("Code: "); txtINdex++;
                                    STRtxt.Add(texts[i]); txtINdex++;
                                    STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                    sheet.Range["H" + excellIndex].Text = FunName;
                                    sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                    sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                    sheet.Range["I" + excellIndex].Text = (i + 1).ToString();
                                    sheet.Range["J" + excellIndex].Text = clean(texts[i].Substring(texts[i].IndexOf("--"), texts[i].Length - texts[i].IndexOf("--")));
                                    excellIndex += 1;
                                }
                                else
                                {

                                    if (texts[i].Contains("IStart ") && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                    {
                                        if (FlagParaI >= 0)
                                        {
                                            ViewBag.ErrorMessage += "After the Line Number " + i + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            FlagParaI = txtINdex;
                                            STRtxt.Add("Line: " + (i + 1)); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            STRtxt.Add(texts[i]); txtINdex++;

                                        }
                                    }
                                    else if (texts[i].Contains("MStart ") && texts[i].Contains((TempData.Peek("Ticket") + ",").ToString()))
                                    {
                                        if (FlagParaM > 0)
                                        {
                                            ViewBag.ErrorMessage += "After the Line Number " + i + " can't find Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            FlagParaM = txtINdex;
                                            STRtxt.Add("Line: " + (i + 1)); txtINdex++;
                                            STRtxt.Add("Code: "); txtINdex++;
                                            STRtxt.Add(texts[i]); txtINdex++;
                                        }
                                    }
                                    else if (texts[i].Contains("IEnd "))
                                    {
                                        if (FlagParaM >= 0 || FlagParaI < 0)
                                        {
                                            STRtxt[FlagParaM] += "-" + (i + 1) + " (Modify)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;

                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2]);
                                            excellIndex += 1;
                                            FlagParaM = -1;

                                            ViewBag.ErrorMessage += "At the Line Number " + i + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            STRtxt[FlagParaI] += "-" + (i + 1) + " (Add)";

                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);

                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2]);
                                            excellIndex += 1;
                                            FlagParaI = -1;

                                        }
                                    }
                                    else if (texts[i].Contains("MEnd "))
                                    {
                                        if (FlagParaI >= 0 || FlagParaM < 0)
                                        {
                                            STRtxt[FlagParaI] += "-" + (i + 1) + " (Add)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaI]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaI + 2]);
                                            excellIndex += 1;
                                            FlagParaI = -1;
                                            ViewBag.ErrorMessage += "At the Line Number " + i + " can't find valid Closing Comment in Following File " + Path.GetFileName(filePath) + "//////////////";
                                            return View();
                                        }
                                        else
                                        {
                                            STRtxt[FlagParaM] += "-" + (i + 1) + " (Modify)";
                                            STRtxt.Add("______________________________________________________________________________________________________________"); txtINdex++;
                                            sheet.Range["H" + excellIndex].Text = FunName;
                                            sheet.Range["G" + excellIndex].Text = Path.GetExtension(filePath).ToString().Substring(1, Path.GetExtension(filePath).ToString().Length - 1).ToUpper();
                                            sheet.Range["F" + excellIndex].Text = Path.GetFileName(filePath);
                                            sheet.Range["I" + excellIndex].Text = clean(STRtxt[FlagParaM]);
                                            sheet.Range["J" + excellIndex].Text = clean(STRtxt[FlagParaM + 2]);
                                            excellIndex += 1;
                                            FlagParaM = -1;
                                        }
                                    }
                                    else
                                    {
                                        ViewBag.ErrorMessage += "At the Line Number " + i + " can't find Valid Comment in Following File " + Path.GetFileName(filePath) + "////////";
                                        return View();
                                    }
                                }


                            }

                        }
                        string[] StrTxtFile = STRtxt.ToArray();
                        if (StrTxtFile.Length > 0)
                        {
                            string txtFilePath = FilePath + "/" + Path.GetFileNameWithoutExtension(filePath) + ".txt";
                            System.IO.File.WriteAllLines(Server.MapPath(txtFilePath), StrTxtFile);

                        }
                    }
                }
                excellIndex -= 1;

                //all files belongs to report move inside Report folder
                for (int fIndex = 0; fIndex < AllFiles.Length; fIndex++)
                {
                    if (Path.GetExtension(AllFiles[fIndex]) == ".rpt")
                    {

                        for (int vIndex = 0; vIndex < AllFiles.Length; vIndex++)
                        {
                            if (Path.GetExtension(AllFiles[vIndex]) == ".vb" &&
                                Path.GetFileNameWithoutExtension(AllFiles[fIndex]) == Path.GetFileNameWithoutExtension(AllFiles[vIndex]))
                            {
                                string sourceOFrptFilePath = RefrenceFilePath + "/" + Path.GetFileName(AllFiles[fIndex]);
                                string DestinationOFrptFilePath = RefrenceFilePath + "/" + "Report/" + Path.GetFileName(AllFiles[fIndex]);
                                createPath((RefrenceFilePath + "/" + "Report").ToString());
                                System.IO.File.Move(Server.MapPath(sourceOFrptFilePath), Server.MapPath(DestinationOFrptFilePath));

                                sourceOFrptFilePath = string.Empty; DestinationOFrptFilePath = string.Empty;
                                sourceOFrptFilePath = RefrenceFilePath + "/" + Path.GetFileName(AllFiles[vIndex]);
                                DestinationOFrptFilePath = RefrenceFilePath + "/" + "Report/" + Path.GetFileName(AllFiles[vIndex]);

                                System.IO.File.Move(Server.MapPath(sourceOFrptFilePath), Server.MapPath(DestinationOFrptFilePath));

                                break;
                            }
                        }

                    }
                }

                //Added new file  to Excell
                string[] newAllFiles = Directory.GetFiles(Server.MapPath(RefrenceFilePath));

                if (!(excellIndex <= 1))
                {
                    for (int i = 0; i < newAllFiles.Length; i++)
                    {
                        bool isNew = true;
                        foreach (var cell in sheet.Range["F2:F" + excellIndex])
                        {
                            if (cell.Text == Path.GetFileName(newAllFiles[i]))
                            {
                                isNew = false;
                                break;
                            }
                        }
                        if (isNew)
                        {
                            excellIndex++;

                            string TempfileNameForcondition = Path.GetFileName(newAllFiles[i]).ToLower();
                            if (TempfileNameForcondition.Contains("script")
                                && TempfileNameForcondition.Contains("changes")
                                && Path.GetExtension(newAllFiles[i]) == ".sql")
                            {
                                sheet["F" + excellIndex].Text = Path.GetFileName(newAllFiles[i]);
                                sheet["J" + excellIndex].Text = "Execute the script";
                            }
                            else
                            {
                                sheet["F" + excellIndex].Text = Path.GetFileName(newAllFiles[i]);
                                sheet["J" + excellIndex].Text = "Please add/replace this file on below path." + System.Environment.NewLine + "Path: ";
                            }

                        }
                    }
                }

                bool is_Exist = Directory.Exists(Server.MapPath(RefrenceFilePath + "/Report"));
                if (is_Exist)
                {
                    newAllFiles = Directory.GetFiles(Server.MapPath(RefrenceFilePath + "/Report"));

                    if (!(excellIndex <= 1))
                    {
                        for (int i = 0; i < newAllFiles.Length; i++)
                        {

                            excellIndex++;

                            sheet["F" + excellIndex].Text = Path.GetFileName(newAllFiles[i]);
                            sheet["J" + excellIndex].Text = "Please add/replace this file on below path." + System.Environment.NewLine + System.Environment.NewLine + "Path: \\BCIS_SPReports\\Reports\\";
                        }
                    }
                }




                //sheet["A1:M" + excellIndex].HorizontalAlignment = HorizontalAlignment.Center;
                sheet.Range["A1:M" + excellIndex].Style.HorizontalAlignment = HorizontalAlignType.Center;


                //string url = "";
                //HtmlWeb web = new HtmlWeb();
                //var htmlDocument = web.Load(url);
                //var ticketTitle= htmlDocument.DocumentNode.SelectSingleNode("//h1[@class='sc-gJqsIT kNHCMx']").InnerText;
                sheet["A1:M" + excellIndex].Style.WrapText = true;
                if (!(excellIndex <= 1))
                {
                    sheet.Range["B2:B" + excellIndex].Text = TempData.Peek("Ticket").ToString();
                    //sheet.Range["B2:B" + excellIndex].Text = ticketTitle;
                    sheet.Range["B2:B" + excellIndex].Merge();
                    sheet.Range["C2:C" + excellIndex].Merge();
                    sheet.Range["D2:D" + excellIndex].Merge();
                    string colRow = string.Empty;
                    if (excellIndex >= 3)
                    {
                        for (int i = 0; i < 3; i++)
                        {
                            int startIndex = 2;
                            if (i == 0)
                                colRow = "F";
                            else if (i == 1)
                                colRow = "G";
                            else
                                colRow = "H";

                            for (int j = 3; j <= excellIndex; j++)
                            {
                                if (sheet.Range[(colRow + startIndex).ToString()].Text == string.Empty)
                                {
                                    startIndex = j;
                                }
                                if (sheet.Range[(colRow + startIndex).ToString()].Text != sheet.Range[(colRow + j).ToString()].Text && startIndex != j)
                                {
                                    if (startIndex != j - 1)
                                    {
                                        sheet.Range[(colRow + startIndex + ":" + colRow + (j - 1)).ToString()].Merge();
                                        sheet.Range[(colRow + startIndex + ":" + colRow + (j - 1)).ToString()].Style.VerticalAlignment = VerticalAlignType.Center;
                                    }
                                    startIndex = j;

                                }

                                if (j == excellIndex && startIndex != j)
                                {
                                    sheet.Range[(colRow + startIndex + ":" + colRow + j).ToString()].Merge();
                                }
                            }

                        }

                    }

                    sheet.Range["B2:B" + excellIndex].Style.VerticalAlignment = VerticalAlignType.Top;

                }

                //sheet.Range["A1:M" + excellIndex].Borders[ExcelBordersIndex.EdgeLeft].LineStyle = ExcelLineStyle.Thin;
                //sheet.Range["A1:M" + excellIndex].Borders[ExcelBordersIndex.EdgeRight].LineStyle = ExcelLineStyle.Thin;
                //sheet.Range["A1:M" + excellIndex].Borders[ExcelBordersIndex.EdgeTop].LineStyle = ExcelLineStyle.Thin;
                //sheet.Range["A1:M" + excellIndex].Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Thin;
                //sheet.Range["A1:M" + excellIndex].CellStyle.Borders[ExcelBordersIndex.EdgeBottom].Color = ExcelKnownColors.Black;
                //sheet.Range["A1:M" + excellIndex].CellStyle.Borders[ExcelBordersIndex.EdgeTop].Color = ExcelKnownColors.Black;
                //sheet.Range["A1:M" + excellIndex].CellStyle.Borders[ExcelBordersIndex.EdgeLeft].Color = ExcelKnownColors.Black;
                //sheet.Range["A1:M" + excellIndex].CellStyle.Borders[ExcelBordersIndex.EdgeRight].Color = ExcelKnownColors.Black;
                //sheet.Range["A1:M1"].Borders[ExcelBordersIndex.EdgeBottom].LineStyle = ExcelLineStyle.Medium;

                //sheet.Range["A1:M" + excellIndex].CellStyle.Font.Size = 12;
                //sheet.Range["A1:M" + excellIndex].CellStyle.Font.FontName = "Arial"; 
                sheet.Range["A1:M" + excellIndex].Style.Font.Size = 12;
                sheet.Range["A1:M" + excellIndex].Style.Font.FontName = "Arial";

                //sheet.Range["A1:M" + excellIndex].Borders.LineStyle = LineStyleType.Thin;
                sheet.Range["A1:M" + excellIndex].BorderInside(LineStyleType.Thin, Color.Black);
                sheet.Range["A1:M" + excellIndex].BorderAround(
                    LineStyleType.Thin, Color.Black);
                sheet.Range["A1:M1"].Borders[BordersLineType.EdgeBottom].LineStyle = LineStyleType.Medium;

                sheet.SetColumnWidth(10, 42);
                sheet.SetColumnWidth(6, 32);
                sheet.SetColumnWidth(8, 32);
                sheet.SetColumnWidth(1, 8);
                sheet.SetColumnWidth(2, 12);
                sheet.SetColumnWidth(3, 12);
                sheet.SetColumnWidth(4, 35);
                sheet.SetColumnWidth(5, 12);
                sheet.SetColumnWidth(7, 12);
                sheet.SetColumnWidth(9, 14);
                sheet.SetColumnWidth(11, 45);
                sheet.SetColumnWidth(12, 45);
                sheet.SetColumnWidth(13, 45);

                int num = 0;
                foreach (var cell in sheet.Range["A2:A" + excellIndex])
                {
                    num++;
                    cell.Text = num.ToString();
                }
                //workbook.SaveAs(Server.MapPath(FilePath + "/(" + TempData.Peek("Ticket") + ")CodeChanges_Documentation_" + ((DateTime)TempData.Peek("StartTicketDate")).ToString("ddMMMMyyyy") + ".xlsx"));
                workbook.SaveToFile(Server.MapPath(FilePath + "/(" + TempData.Peek("Ticket") + ")CodeChanges_Documentation_" + ((DateTime)TempData.Peek("StartTicketDate")).ToString("ddMMMMyyyy") + ".xls"), Spire.Xls.ExcelVersion.Version97to2003);

                bool Is_date(string str)
                {
                    foreach (string strDate in RangeOfDate)
                    {
                        if (str.Contains(strDate + " "))
                        {
                            return true;
                        }
                    }
                    return false;
                }


                return View();
            }
            catch (Exception e)
            {
                ViewBag.ErrorMessage = e;
                return View();

            }


        }
        public FileResult Download()
        {

            string FilePath = "~/Documentation/" + TempData.Peek("Ticket") + "/" + ((DateTime)TempData.Peek("EndTicketDate")).ToString("ddMMMMyyyy");


            string zipPath = @".\result.zip";
            FileInfo file = new FileInfo(Server.MapPath("~/Documentation/" + zipPath));
            if (file.Exists)//check file exsit or not  
            {
                file.Delete();
            }
            System.IO.Compression.ZipFile.CreateFromDirectory(Server.MapPath(FilePath), Server.MapPath("~/Documentation/" + zipPath));
            return File(Server.MapPath("~/Documentation/" + zipPath),
                                   "application/zip", "result.zip");
            //using (MemoryStream ms = new MemoryStream())
            //{
            //    using (ZipArchiveEntry zipArchiv = new System.IO.Compression.ZipArchive(ms, ZipArchiveMode.Create, true))
            //    {
            //        DirectoryInfo dir = new DirectoryInfo(FilePath);
            //        foreach (FileInfo file in dir.GetFiles())
            //        {
            //            zipArchiv.CreateEntryFromFile();
            //        }
            //    }
            ////}


        }
        //public ActionResult DeleteFile()
        //{

        //}


    }

}