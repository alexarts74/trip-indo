// "use client";

// // import { emailConfig } from "../config/email";

// export default function EmailConfigHelp() {
//   return (
//     <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
//       <div className="flex items-start space-x-3">
//         <div className="flex-shrink-0">
//           <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-bold">⚙️</span>
//           </div>
//         </div>
//         <div className="flex-1">
//           <h4 className="text-sm font-semibold text-amber-800 mb-2">
//             Configuration des emails
//           </h4>

//           <div className="space-y-2 text-xs text-amber-700">
//             <p>
//               <strong>Service :</strong> {emailConfig.service}
//             </p>
//             <p>
//               <strong>Limite gratuite :</strong> {emailConfig.freeLimit}
//             </p>

//             <div className="mt-3 p-2 bg-amber-100 rounded text-xs">
//               <strong>Configuration rapide :</strong>
//               <br />
//               1. {emailConfig.setupInstructions.step1}
//               <br />
//               2. {emailConfig.setupInstructions.step2}
//               <br />
//               3. {emailConfig.setupInstructions.step3}
//               <br />
//               4. {emailConfig.setupInstructions.step4}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
