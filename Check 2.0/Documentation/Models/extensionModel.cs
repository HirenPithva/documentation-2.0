using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace check.Models
{
    public class extensionModel
    {
        private List<string> ListExtension = new List<string>(new string[] { ".rpt", ".vb", ".js", ".sql", ".xsc", ".xsd", ".xss", ".html" });
        public List<string> ExtensionRef
        {
            get { return ListExtension; }
        }
    }
}