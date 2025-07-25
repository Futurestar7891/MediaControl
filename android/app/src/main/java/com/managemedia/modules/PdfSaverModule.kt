package com.managemedia.modules

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream

class PdfSaverModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MediaStoreSaver"
    }

    @ReactMethod
    fun savePdf(pdfPath: String, fileName: String, promise: Promise) {
        try {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/myapp")
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }

            val resolver = reactApplicationContext.contentResolver
            val collection =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                } else {
                    MediaStore.Files.getContentUri("external")
                }

            val itemUri = resolver.insert(collection, contentValues)
            if (itemUri == null) {
                promise.reject("E_NULL_URI", "Failed to create new MediaStore record.")
                return
            }

            val inputStream = FileInputStream(File(pdfPath))
            val outputStream: OutputStream? = resolver.openOutputStream(itemUri)

            if (outputStream != null) {
                inputStream.copyTo(outputStream)
                inputStream.close()
                outputStream.close()
            }

            contentValues.clear()
            contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(itemUri, contentValues, null, null)

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("PdfSaverModule", "Error saving PDF", e)
            promise.reject("E_SAVE_FAILED", e.message)
        }
    }
}
