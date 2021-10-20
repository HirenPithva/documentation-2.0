using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace check.Models
{
    public class fileModel
    {
        public IEnumerable<SelectListItem> bilabels { get; set; }
        [Display(Name = "DEVELOPER:")]
        public string Bilabel { get; set; }
        [Display(Name = "START DATE:")]
        public DateTime StartTicketDate { get; set; }
        [Display(Name = "END DATE:")]
        public DateTime EndTicketDate { get; set; }
        [Display(Name = "TICKET-NAME:")]
        public string Ticket { get; set; }
        public HttpPostedFileBase[] files { get; set; }
        public List<string> FilePaths { get; set; }
    }
}