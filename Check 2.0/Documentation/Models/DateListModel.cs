using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace check.Models
{
    public class DateListModel
    {
        public List<string> DatesInTxt = new List<string>();
        public List<string> DateRange(DateTime SDate, DateTime EDate)
        {
            for (DateTime date = SDate; date <= EDate; date = date.AddDays(1))
            {
                string d = date.ToString("MM/dd/y");
                d = d.Replace("-", "/");
                DatesInTxt.Add(d);
            }
            return DatesInTxt;
        }
    }
}